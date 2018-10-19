# == Schema Information
#
# Table name: rooms
#
#  id            :bigint(8)        not null, primary key
#  name          :string(255)
#  floorplan_id  :integer
#  owner_id      :integer
#  meeting_id    :string(255)
#  host_id       :string(255)
#  room_type     :string(255)
#  max_occupancy :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  floor_id      :integer
#
# Indexes
#
#  index_rooms_on_floor_id  (floor_id)
#  index_rooms_on_owner_id  (owner_id)
#

class Room < ApplicationRecord
  belongs_to :owner, class_name: 'User', optional: true
  belongs_to :floor
  has_many :occupants, class_name: 'User', foreign_key: 'current_room_id', counter_cache: true
  has_many :guests, class_name: 'Guest', foreign_key: 'current_room_id', counter_cache: true
  has_many :pinned_rooms, dependent: :delete_all

  validates_presence_of :name, :max_occupancy

  ENTRANCE_SPACES = %w(lobby watercooler)

  OFFICE_NAMES = ['Holmington Castle', 'Mortbunge Marsh', 'Blackfield Mountain', 'Highwood Mount', 'Moorsworth',
                  'Village Of Winhill', 'Caves Of Dalwardine', 'Snowwyvern', 'Silvercastle', 'Summerhall', 'Swynhill', 'Ermina',
                  'Aztlan', 'Vousolus Dale', 'Batrook Deserts', 'Doa\'i Mere', 'Aelochual Straits', 'Riprot Isle', 'Fraisalu Forests',
                  'Rightdip Canyon', 'Chytr Crossing', 'Mortbunge Marsh', 'Blackfield Mountain', 'Drakedwarf Beach', 'Wavebug Outpost',
                  'The Heir of Shadow', 'The Thief of Ice', 'The Keeper of Hope', 'The Reaper', 'The Mage of Blood', 'The Warrior of Light',
                  'The Rogue of Destiny ', 'The Guardian of Mind', 'The Soldier of Metal', 'The Prince of Knowledge', 'The Queen of Mist',
                  'The Seer of All', 'The King of Ink', 'The Bard of Justice', 'Faylight']

  # room name, room type, max occupancy, and floorplan id
  SPECIAL_ROOMS = [['Water Cooler', 'watercooler', 12, 0],
                   ['Cafeteria', 'cafeteria', 44, 1],
                   ['Auditorium', 'auditorium', 44, 2],
                   ['Lobby', 'lobby', 12, 3],
                   ['Conference Room', 'meeting', 12, 4],
                   ['Conference Room', 'meeting', 12, 5],
                   ['Conference Room', 'meeting', 12, 6],
                   ['Conference Room', 'meeting', 12, 7]]

  def office?
    room_type == 'office'
  end

  def self.next_open_meeting_room(floor)
    Room.where(room_type: 'meeting', floor: floor).find { |room| room.occupants.count.zero? }
  end

  def self.next_open_room
    ENTRANCE_SPACES.each do |entrance_space|
      room = Room.find_by_room_type(entrance_space)
      return room if room.occupants.count < room.max_occupancy
    end
    Room.find_by_room_type('auditorium')
  end

  def slack_url
    return '' unless office? && owner.present? && occupants.length.between?(2, 8) && owner.uid

    client = Slack::Web::Client.new(token: owner.slack_token)
    uids = occupants.pluck(:uid)

    channel_id =
      if uids.size == 2
        client.im_open(user: (uids - [owner.uid]).first).channel.id
      else
        client.mpim_open(users: uids.sort.join(', ')).group.id
      end

    "slack://channel?team=T02LE0A28&id=#{channel_id}"
  end

  def clear_meeting
    unless meeting_id.nil? && host_id.nil?
      logger.fatal "CLEARING MEETING FOR #{name}"
      Zoomus.new.meeting_end(host_id: host_id, id: meeting_id)
      update_attributes(meeting_id: nil, host_id: nil)
      return true
    end

    false
  end

  def send_everyone_home
    occupants.each do |occupant|
      home = occupant.home || Room.find_by_floorplan_id(0)
      occupant.update_attributes(current_room: home)
    end
    guests.each(&:destroy)
  end

  def move_to_meeting_room
    return unless office? && (occupants.count + guests.count) > Rails.application.secrets.max_office_size
    meeting_room = Room.next_open_meeting_room(floor)
    return unless move_to_room(meeting_room)

    occupants.each { |occupant| WebpushNotifier.notify(occupant, "#{name} is crowded! Let's move to #{meeting_room.name}.") }
  end

  def move_to_room(room)
    # fail silently if room is not available
    return false unless room.present? || room.meeting_id.present?

    room.update_attributes(meeting_id: meeting_id, host_id: host_id)
    MapNotifier.room_update(room.id, meeting_id: room.meeting_id, slack_url: slack_url)

    update_attributes(meeting_id: nil, host_id: nil)
    MapNotifier.room_update(id, meeting_id: nil)

    occupants.each { |occupant| occupant.update_attributes(current_room: room) }
    guests.each { |guest| guest.update_attributes(current_room: room) }

    return true unless meeting_in_progress?
    room.occupants.each { |occupant| MapNotifier.join_running_meeting(user: occupant.id, meeting_url: room.meeting_url, room_id: id) }
    true
  end

  def send_message(sender, recipients, message)
    recipients -= [sender]
    return if recipients.size.zero?

    client = Slack::Web::Client.new(token: sender.slack_token)
    channel_id =
      if recipients.size == 1
        client.im_open(user: recipients.first.uid).channel.id
      else
        recipient_ids = recipients.pluck(:uid).sort.join(', ')
        client.mpim_open(users: recipient_ids).group.id
      end

    client.chat_postMessage(channel: channel_id, text: message)
  end

  def meeting_in_progress?
    return false unless meeting_id.present? && host_id.present?

    Meeting.new(host_id: host_id, id: meeting_id).started?
  end

  def meeting_url
    meeting_id.present? ? "https://zoom.us/j/#{meeting_id}" : meeting_id
  end
end
