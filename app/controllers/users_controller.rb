class UsersController < ApplicationController
  before_action :set_user, except: [:index, :create, :theme, :guests, :history, :present, :welcome, :destroy]
  before_action :authenticate_user!
  before_action :authorize_user, only: [:create, :update, :destroy]

  def index
    options = {}
    options[:include] = [:pinned_rooms, :watching]
    options[:params] = { id: current_user.id }
    render json: UserSerializer.new(User.all.includes(:home), options).serialized_json
  end

  def guests
    render json: GuestSerializer.new(Guest.all).serialized_json
  end

  def welcome
    render json: { errors: "You're not authorized to to take this action!" }, status: :unauthorized and return unless current_user.admin?

    @user = User.new(user_params.merge(theme: 'default', color: SecureRandom.hex(3), state: 'available', password: Devise.friendly_token[0, 20], current_room: user_params['home'] || Room.next_open_room, present: false))
    if @user.save
      render json: @user.to_json
    else
      render json: { errors: @user.errors.messages.slice(:first_name, :color, :theme).to_a.map { |error| [error.first.to_s, error.last.last].join(' ') } }, status: :bad_request
    end
  end

  def update
    update_back_by_reminder(user_params)
    verify_admin_updates(user_params) or return

    render json: { errors: "Sorry! You can't update your email." }, status: :bad_request and return if user_params.key?(:email)

    @user.assign_attributes(user_params)
    render json: {} and return unless @user.changed?
    if @user.save
      render json: @user.to_json
    else
      render json: { errors: @user.errors.messages.slice(:first_name, :color, :theme).to_a.map { |error| [error.first.to_s, error.last.last].join(' ') } }, status: :bad_request
    end
  end

  def invite
    begin
      current_user.invite(@user)
    rescue ArgumentError => e
      render json: { errors: e.message }, status: :bad_request and return
    end
    render json: {}
  end

  def call
    if current_user.current_room.meeting_in_progress?
      message = "Knock, knock! #{current_user.first_name} has invited you to #{current_user.current_room.name}. Meeting link: #{current_user.current_room.meeting_url}"
      current_user.current_room.send_message(current_user, [@user], message)
      render json: {}
    else
      render json: { errors: "call #{@user.first_name} after you start a meeting!" }, status: :bad_request
    end
  end

  def slack_presence
    client = Slack::Web::Client.new(token: current_user.slack_token)
    render json: { slack_presence: client.users_getPresence(user: current_user.uid).presence }
  end

  def watch
    render json: { errors: "Sorry! You can't watch yourself." }, status: :bad_request and return if current_user == @user

    num_watchers = @user.watchers.size
    message =
      if num_watchers.zero?
        "You're next in line!"
      else
        "#{num_watchers} other #{num_watchers > 1 ? 'people are' : 'person is'} waiting to talk to #{@user.first_name}."
      end
    SlackNotifier.notify(current_user, "We'll let you know when #{@user.first_name} is free. #{message}")
    current_user.watch @user
    MapNotifier.user_update(id: current_user.id, watching_ids: current_user.watching_ids)

    render json: {}
  end

  def unwatch
    current_user.unwatch @user
    MapNotifier.user_update(id: current_user.id, watching_ids: current_user.watching_ids)
    render json: {}
  end

  def message
    client = Slack::Web::Client.new(token: current_user.slack_token)

    if @user.free? && @user.present && client.users_getPresence(user: @user.uid).presence == 'away'
      WebpushNotifier.notify(@user, "#{current_user.first_name} is trying to message you, but you're not online in Slack!", 'slack')
    end

    render json: {}
  end

  def send_home
    unless current_user.current_room.occupants.include? @user
      render json: { errors: 'You can only kick people out of your own office!' }, status: :bad_request and return
    end

    if (current_user == @user) && current_user.home.nil?
      render json: { errors: "You haven't set a home yet. Find an empty office and claim it by clicking on the tiny home icon that appears in the lower right corner." }, status: :bad_request and return
    end

    @user.update_attributes(current_room: @user.home || Room.next_open_room)

    render json: @user.to_json
  end

  def destroy
    # byebug
    @user = (params[:id].include? "_guest") ?  Guest.find_by_id(params[:id].remove("_guest")) : User.find_by_id(params[:id])

    render json: { errors: "Couldn't find User with 'id'=#{params[:id]}" }, status: :bad_request and return if @user.nil?
    render json: { errors: "You can't delete yourself!" }, status: :bad_request and return if @user == current_user
    @user.destroy
    render json: {}
  end

  private

  def update_back_by_reminder(user_params)
    @user.clear_back_by_reminder if user_params.key?(:back_by) || user_params.key?(:state)
    @user.schedule_back_by_reminder(Time.parse(user_params[:back_by])) if user_params.key?(:back_by) && user_params[:back_by].present?
  end

  def verify_admin_updates(user_params)
    return true unless user_params.key?(:admin)
    if !current_user.admin?
      render json: { errors: "You're not authorized to to take this action!" }, status: :unauthorized and return
    elsif current_user == @user && !user_params[:admin]
      render json: { errors: "You can't update your own admin status!" }, status: :bad_request and return
    end

    true
  end

  def authorize_user
    return if @user == current_user || current_user.admin?
    render json: { errors: "You're not authorized to to take this action!" }, status: :bad_request
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_user
    @user = User.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def user_params
    params.require(:user).permit(:first_name, :last_name, :email, :status, :color, :state, :back_by, :present, :emotion, :score, :theme, :timezone, :use_pmi, :department_id, :aliases, :admin)
  end
end
