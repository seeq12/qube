# == Schema Information
#
# Table name: users
#
#  id                     :bigint(8)        not null, primary key
#  first_name             :string(255)
#  present                :boolean          default(TRUE)
#  state                  :string(255)
#  status                 :string(255)
#  back_by                :datetime
#  timezone               :string(255)
#  use_pmi                :boolean          default(FALSE)
#  slack_dms              :text(65535)
#  color                  :string(255)
#  emotion                :string(255)
#  theme                  :string(255)
#  current_room_id        :integer
#  admin                  :boolean          default(FALSE)
#  last_room_entered_at   :datetime
#  last_watched_timestamp :datetime
#  slack_token            :string(255)
#  zoom_host_id           :string(255)
#  endpoint               :string(255)
#  p256dh                 :string(255)
#  auth                   :string(255)
#  job_id                 :string(255)
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  email                  :string(255)
#  encrypted_password     :string(255)      default(""), not null
#  reset_password_token   :string(255)
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default(0), not null
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :string(255)
#  last_sign_in_ip        :string(255)
#  unique_session_id      :string(20)
#  provider               :string(255)
#  uid                    :string(255)
#  score                  :integer
#  last_offline           :datetime
#  aliases                :text(65535)
#  department_id          :integer
#  last_name              :string(255)
#
# Indexes
#
#  index_users_on_current_room_id       (current_room_id)
#  index_users_on_department_id         (department_id)
#  index_users_on_email                 (email) UNIQUE
#  index_users_on_provider              (provider)
#  index_users_on_reset_password_token  (reset_password_token) UNIQUE
#  index_users_on_uid                   (uid)
#

class User < ApplicationRecord
  has_one :home, class_name: 'Room', foreign_key: 'owner_id'
  belongs_to :current_room, class_name: 'Room', optional: true
  belongs_to :department
  has_many :watcher_relationships, foreign_key: :watching_id, class_name: 'Watch'
  has_many :watchers, through: :watcher_relationships, source: :watcher
  has_many :watching_relationships, foreign_key: :watcher_id, class_name: 'Watch'
  has_many :watching, through: :watching_relationships, source: :watching
  has_many :pinned_rooms, dependent: :destroy
  serialize :aliases

  validates_presence_of :first_name, :email
  validates_format_of :color, with: /\A#?(?:[A-F0-9]{3}){1,2}\z/i, message: 'must be a valid CSS hex color code'
  validates_inclusion_of :theme, in: Dir.entries(Rails.root.join('vendor', 'assets', 'themes')).reject { |f| File.directory? f }.map { |t| t.chomp('.scss') }

  before_save :update_last_room_entered_timestamp
  before_save :update_last_offline
  before_save :ensure_higher_score
  after_create :update_everyone

  after_update :update_slack_dms, if: :saved_change_to_slack_token?
  after_update :update_status_slack, if: :slack_status_changed?
  after_update :update_everyone, if: :public_attribute_changed?
  after_commit :notify_watchers, if: :newly_pounceable?

  after_destroy :notify_destroy

  devise :database_authenticatable, :registerable, :omniauthable, :recoverable, :rememberable, :trackable, :validatable, :session_limitable

  NOTIFIABLE_FIELDS = [:first_name, :last_name, :back_by, :status, :state, :emotion, :color, :current_room_id, :last_room_entered_at, :use_pmi, :department_id, :timezone, :admin]
  STATES = ['available', 'busy', 'BRB', 'Feeling social']

  def name
    "#{first_name} #{last_name}"
  end

  def home_id
    home.try(:id)
  end

  def update_slack_dms
    # Slack DMs are precomputed and saved as a JSON hash of user_ids to slack DM channel ids
    SlackDMUpdaterJob.perform_async(id, slack_token)
  end

  def free?
    state == 'available' || state == 'Feeling social'
  end

  def can_pounce?
    free? && present && (current_room == home) && (current_room.occupants.count == 1)
  end

  def newly_pounceable?
    becomes_free? && pounceable?
  end

  def pounceable?
    can_pounce? && watchers.present?
  end

  def watching_ids
    watching.pluck(:id)
  end

  def slack_status
    if back_by.present?
      back_by_local = back_by.in_time_zone(timezone).strftime('%-l:%M%P %Z')
      return "#{status} BB #{back_by_local}"
    end
    status
  end

  def notify_watchers
    Delayed::Job.enqueue WatcherNotificationJob.new(self), run_at: Time.now + Rails.application.secrets.watcher_notification_delay_seconds.seconds
    Delayed::Job.enqueue WatchedNotificationJob.new(self), run_at: Time.now + Rails.application.secrets.watched_notification_delay_seconds.seconds if can_receive_watch_digest?
  end

  def watch(user)
    watching_relationships.create!(watching: user) unless watching.include? user
  end

  def unwatch(user)
    watching_relationships.find_by(watching: user).destroy if watching.include? user
  end

  # warning: requires external save!!
  def clear_back_by_reminder
    return unless job_id.present?

    job = Delayed::Job.find_by(id: job_id)
    job.delete if job.present?
    assign_attributes(job_id: nil)
  end

  # warning: requires external save!!
  def schedule_back_by_reminder(back_by_time)
    padding = [((back_by_time - Time.now) * 0.3).seconds, 5.minutes].max
    job = Delayed::Job.enqueue ReminderJob.new(self), run_at: back_by_time + padding
    assign_attributes(job_id: job.id)
  end

  def invite(user)
    return if user.current_room == current_room

    room_request = RoomRequest.create!(room: current_room, requester: self, entrant: user)
    WebpushNotifier.notify(self, "You've invited #{user.first_name} to #{current_room.name}.")

    message = "Knock, knock! #{first_name} has invited you to #{current_room.name}."
    WebpushNotifier.notify_with_action(user, message, room_request.id)

    message = "#{first_name} has invited #{user.first_name} to #{current_room.name}."
    (current_room.occupants - [self]).each { |occupant| WebpushNotifier.notify(occupant, message) }
  end

  def invite_all(users)
    unless users.present?
      WebpushNotifier.notify(self, "There's no one left to invite to #{current_room.name}! Everyone's offline or busy.")
      return
    end

    WebpushNotifier.notify(self, "You've invited everyone who's available to #{current_room.name}.")
    message = "#{first_name} has invited everyone who's available to #{current_room.name}."
    (current_room.occupants - [self]).each { |occupant| WebpushNotifier.notify(occupant, message) }

    unreachable_users = []
    users.each do |user|
      room_request = RoomRequest.create!(room: current_room, requester: self, entrant: user)
      message = "Knock, knock! #{first_name} has invited you to #{current_room.name}."

      begin
        WebpushNotifier.notify_with_action(user, message, room_request.id)
      rescue ArgumentError => e
        unreachable_users << e.message
      end
    end
    unreachable_users
  end

  def knock(room)
    return unless room.office? && current_room != room
    room_request = RoomRequest.create!(room: room, requester: self, entrant: self, acceptable_from_room: current_room)

    WebpushNotifier.notify(self, "Knock, knock! Requesting entrance to #{room.name}.")

    message = "Knock, knock! #{first_name} would like to enter #{room.name}."
    room.occupants.each { |occupant| WebpushNotifier.notify_with_action(occupant, message, room_request.id) }
  end

  def self.from_omniauth(auth)
    logger.fatal "email: #{auth.info.emai}"
    user = find_by_email(auth.info.email)
    logger.fatal "user if found: #{user.inspect}"
    logger.fatal "settings: #{Setting.instance.self_registration}"
    logger.fatal "user count zero: #{User.count.zero?}"
    return user if user.present? && user.zoom_host_id.present?
    return nil if user.nil? && !(Setting.instance.self_registration || User.count.zero?)

    user = User.new(email: auth.info.email, theme: 'default', color: SecureRandom.hex(3), state: 'available', password: Devise.friendly_token[0, 20], current_room: Room.next_open_room) if user.nil?
    logger.fatal "new user: #{user.inspect}"

    zoom_client = Zoomus.new
    user_info = zoom_client.user_getbyemail(email: user.email
    logger.fatal "zoom user info: #{user_info}"
    return unless user_info['id']

    user.first_name ||= auth.info.nickname
    user.status = auth.extra.user_info.user.profile.status_text
    user.present = true
    user.slack_token = auth.credentials.token
    user.admin = true if User.count.zero?
    user.zoom_host_id = user_info['id']
    user.uid = auth.uid
    user.provider = auth['provider']
    client = Slack::Web::Client.new(token: user.slack_token)
    user.timezone ||= client.users_info(user: auth.uid, include_local: true).user.tz
    logger.fatal "updated user: #{user.inspect}"

    user
  end

  # required for devise
  def email_required?
    false
  end

  # required for devise
  def email_changed?
    false
  end

  def self.free_state?(state)
    state == 'available' || state == 'Feeling social'
  end

  private

  def can_receive_watch_digest?
    return true unless last_watched_timestamp.present?
    last_watched_timestamp + Rails.application.secrets.min_minutes_between_watch_digests.minutes < Time.now
  end

  def update_last_room_entered_timestamp
    self.last_room_entered_at = Time.now if will_save_change_to_current_room_id?
  end

  def update_last_offline
    self.last_offline = Time.now if present_change == [true, false]
  end

  def ensure_higher_score
    return unless will_save_change_to_score?
    self.score = score_change[0] if score_change[0] && score_change[0] > score_change[1]
  end

  def becomes_free?
    persisted? && (saved_change_to_back_by? || saved_change_to_state? || saved_change_to_current_room_id? || (saved_change_to_present? && (last_offline.nil? || last_offline + Rails.application.secrets.comes_online_notification_delay_minutes.minutes < Time.now)))
  end

  def public_attribute_changed?
    persisted? && NOTIFIABLE_FIELDS.any? { |k| saved_changes.key?(k) }
  end

  def update_everyone
    params = saved_changes.map { |k, v| [k.to_sym, v.last] }.to_h.slice(*NOTIFIABLE_FIELDS).merge(id: id)
    MapNotifier.user_update(params)
  end

  def notify_destroy
    MapNotifier.destroy_user(id)
  end

  def slack_status_changed?
    saved_change_to_status? || saved_change_to_back_by?
  end

  def update_status_slack
    SlackStatusUpdaterJob.perform_async(slack_token, slack_status)
  end
end
