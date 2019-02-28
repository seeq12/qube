class RoomsController < ApplicationController
  before_action :set_room, except: [:index, :new, :create, :end_meeting]
  before_action :authenticate_user!

  def index
    render json: RoomSerializer.new(Room.all).serialized_json
  end

  def update
    render json: { errors: 'You can only update your own office.' }, status: :bad_request and return if @room != current_user.home && !current_user.admin?

    if @room.update(room_params)
      MapNotifier.room_update(@room.id, room_params)
      render json: @room.to_json
    else
      render json: { errors: @room.errors.messages.slice(:name) }, status: :bad_request
    end
  end

  def enter
    render json: { errors: "You can't just enter someone's office! Knock first." }, status: :bad_request and return unless enterable?

    previous_room = current_user.current_room
    render json: {} and return if previous_room == @room || meeting_moves_with_entrant(previous_room)

    current_user.update_attributes(current_room: @room)
    MapNotifier.join_running_meeting(user: current_user.id, meeting_url: @room.meeting_url, room_id: @room.id) if @room.meeting_in_progress?
    previous_room.clear_meeting

    render json: {}
  end

  def knock
    begin
      current_user.knock(@room)
    rescue ArgumentError => e
      render json: { errors: e.message }, status: :bad_request and return
    end
    render json: {}
  end

  def claim
    render json: { errors: 'This office is already claimed.' }, status: :bad_request and return if @room.owner.present?

    user =
      if params[:user_id].present?
        render json: { errors: "You're not authorized to to take this action!" }, status: :unauthorized and return unless current_user.admin?
        User.find(params[:user_id])
      else
        current_user
      end

    previous_home = user.home

    if previous_home.present?
      user.home.update_attributes(owner: nil)
      MapNotifier.room_update(previous_home.id, owner_id: nil)
    end

    user.update_attributes(current_room: @room, home: @room)

    MapNotifier.room_update(@room.id, owner_id: user.id)
    MapNotifier.user_update(id: user.id, home_id: @room.id)

    if previous_home.present?
      user.pinned_rooms.each do |pinned_room|
        if pinned_room.room.floor_id == @room.floor_id
          pinned_room.destroy
        end
      end
      MapNotifier.user_update(id: user.id, pinned_rooms: user.pinned_rooms.reload)

      pinned_rooms = PinnedRoom.where(room: previous_home)
      pinned_rooms.each do |pinned_room|
        if pinned_room.user.home.floor_id == @room.floor_id
          pinned_room.destroy
          MapNotifier.user_update(id: pinned_room.user_id, pinned_rooms: pinned_room.user.pinned_rooms)
        else
          pinned_room.update(room: @room)
          MapNotifier.user_update(id: pinned_room.user_id, pinned_rooms: pinned_room.user.pinned_rooms)
        end
      end
    end

    render json: {}
  end

  def start_meeting
    MeetingSchedulerJob.perform_async(@room.id, current_user.id)

    render json: {}
  end

  def end_meeting
    @room = Room.includes(occupants: [:home, :current_room]).where(id: params[:id]).first

    message = "#{current_user.first_name} #{current_user.last_name} has ended your current meeting in #{@room.name}."
    (@room.occupants - [current_user]).each { |occupant| WebpushNotifier.notify(occupant, message) }

    @room.kill_meeting

    MapNotifier.spinner_stop(@room.id)
    @room.send_everyone_home

    render json: {}
  end

  def invite
    render json: { errors: 'You can only invite people to the auditorium or cafeteria.' }, status: :bad_request and return unless @room.room_type == 'auditorium' || @room.room_type == 'cafeteria'

    unreachable_users = current_user.invite_all(User.where.not(current_room: @room).where(state: ['available', 'Feeling social'], present: true))
    render json: {} and return if unreachable_users.empty?
    render json: { errors: unreachable_users.join("\n") }, status: :bad_request
  end

  def star
    pinned_room = PinnedRoom.new(user: current_user, room: @room, position_id: params[:position_id])
    if pinned_room.save
      MapNotifier.user_update(id: current_user.id, pinned_rooms: current_user.pinned_rooms)
      render json: {}
    else
      render json: { errors: pinned_room.errors.messages.to_a.map { |error| error.first.to_s == 'base' ? error.last.last : [error.first.to_s, error.last.last].join(' ') } }, status: :bad_request
    end
  end

  def unstar
    PinnedRoom.find_by(user: current_user, room: @room).destroy
    MapNotifier.user_update(id: current_user.id, pinned_rooms: current_user.pinned_rooms)
    render json: {}
  end

  private

  def enterable?
    !@room.office? || @room.owner == current_user
  end

  def meeting_moves_with_entrant(previous_room)
    return false unless previous_room.meeting_id.present? && previous_room.host_id == current_user.zoom_host_id && @room.meeting_id.nil? && !@room.office?

    previous_room.move_to_room(@room)
    true
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_room
    @room = Room.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def room_params
    params.require(:room).permit(:name)
  end
end
