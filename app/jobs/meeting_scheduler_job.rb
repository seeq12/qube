class MeetingSchedulerJob
  include SuckerPunch::Job

  def perform(room_id, host_id)
    ActiveRecord::Base.connection_pool.with_connection do
      host = User.find_by_id(host_id)
      room = Room.find_by_id(room_id)

      meeting_url = Meeting.launch_for_host(room, host)
      return if Meeting.start_with_nudges(3, 0, room, host_id, meeting_url)
      Meeting.send_warning_info(room, host) # It's been six seconds, it's taking awhile...

      return if Meeting.start_with_nudges(5, 3, room, host_id, meeting_url)
      Meeting.send_error_info(room, host) # Time to give up, we can't start the host's meeting.
      end
  end
end
