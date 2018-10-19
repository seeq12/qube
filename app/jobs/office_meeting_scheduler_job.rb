class OfficeMeetingSchedulerJob
  include SuckerPunch::Job

  def perform(room_request_id, current_user_id)
    room_request = RoomRequest.find(room_request_id)
    current_user = User.find_by_id(current_user_id)
    room = room_request.room
    host = room_request.knock? ? current_user : room_request.requester

    update_room_state(room_request, current_user)
    if room.meeting_in_progress?
      MapNotifier.join_running_meeting(user: room_request.entrant.id, meeting_url: room.meeting_url, room_id: room.id)
      room.move_to_meeting_room
      return
    end

    # There were already people 'meeting' without a zoom meeting, keep it that way.
    return if (room.occupants - [room_request.entrant]).size > 1

    meeting_url = Meeting.launch_for_host(room, host)
    return if Meeting.start_with_nudges(3, 0, room, host.id, meeting_url, room_request.entrant)
    Meeting.send_warning_info(room, host) # It's been six seconds, it's taking awhile...

    return if Meeting.start_with_nudges(5, 3, room, host.id, meeting_url, room_request.entrant)
    Meeting.send_error_info(room, host) # Time to give up, we can't start the host's meeting.
  end

  private

  def update_room_state(room_request, current_user)
    previous_room = room_request.entrant.current_room
    if previous_room != room_request.room && previous_room.occupants.count.zero?
      MapNotifier.room_update(previous_room.id, meeting_id: nil) if previous_room.clear_meeting
    end

    room_request.entrant.update_attributes(current_room: room_request.room)
    room_request.update_attributes(accepted_at: Time.now)
    update_watches(room_request.room, current_user, room_request.requester)

    message = "#{room_request.entrant.name} has entered #{room_request.room.name}."
    room_request.room.occupants.each { |occupant| WebpushNotifier.notify(occupant, message) }

    MapNotifier.room_update(room_request.room.id, slack_url: room_request.room.slack_url)
  end

  def update_watches(room, user1, user2)
    return unless room.office?

    MapNotifier.user_update(id: user1.id, watching_ids: user1.watching_ids) if user1.unwatch(user2)
    MapNotifier.user_update(id: user2.id, watching_ids: user2.watching_ids) if user2.unwatch(user1)
  end
end
