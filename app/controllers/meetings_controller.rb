class MeetingsController < ApplicationController
  def zoom
    meeting = Meeting.new(request.parameters['payload']['meeting'])

    case request.parameters['event']
    when 'meeting_ended'
      end_meeting(meeting)
    when 'participant_left'
      participant = request.parameters['payload']['meeting']['participant']

      leave_meeting(participant, meeting)
    when 'participant_joined'
      participant = request.parameters['payload']['meeting']['participant']

      join_meeting(participant, meeting)
    when 'meeting_started'
      synchronize_scheduled_meeting(meeting) unless meeting.managed_by_qube?
    end

    render json: {}
  end

  private

  def end_meeting(meeting)
    return unless meeting.room.present?
    meeting.room.update_attributes(meeting_id: nil, host_id: nil)
    MapNotifier.room_update(meeting.room.id, meeting_id: nil)
    meeting.room.send_everyone_home

    user = User.find_by_zoom_host_id(meeting.host_id)
    clear_status(user)
    MapNotifier.ghost_user_join(user.id, meeting.room.id) unless user.present
    user.notify_watchers if meeting.room.office? && user.pounceable?
  end

  def join_meeting(participant, meeting)
    qube_participant = find_qube_user(participant)
    MapNotifier.joined_meeting(qube_participant.id) if qube_participant
    return if participant['user_id'] == meeting.host_id # special case for meeting_started hook

    add_participant_to_meeting(qube_participant, participant, meeting) if meeting.managed_by_qube?
  end

  def leave_meeting(participant, meeting)
    return if participant['user_id'] == meeting.host_id # special case for meeting_ended hook

    remove_participant_from_meeting(participant, meeting) if meeting.managed_by_qube?
  end

  def find_qube_user(participant)
    return nil unless participant['user_id'].present?
    User.find_by_zoom_host_id(participant['user_id'])
  end

  def add_participant_to_meeting(qube_participant, participant, meeting)
    if qube_participant
      return if qube_participant.current_room == meeting.room
      qube_participant.update_attributes(current_room: meeting.room)
      MapNotifier.ghost_user_join(qube_participant.id, meeting.room.id) unless qube_participant.present
    elsif participant['user_name'].present?
      Guest.where(first_name: participant['user_name'], current_room: meeting.room).first_or_create(color: SecureRandom.hex(3)) if participant['user_name'].present?
    else
      return
    end

    meeting.room.move_to_meeting_room
  end

  def remove_participant_from_meeting(participant, meeting)
    qube_participant = find_qube_user(participant)
    if qube_participant
      return if qube_participant.current_room != meeting.room
      qube_participant.update_attributes(current_room: qube_participant.home || Room.next_open_room)
      MapNotifier.ghost_user_leave(qube_participant.id, meeting.room.id) unless qube_participant.present
    elsif participant['user_name'].present?
      Guest.where(first_name: participant['user_name'], current_room: meeting.room).destroy_all
    end
  end

  def synchronize_scheduled_meeting(meeting)
    user = User.find_by_zoom_host_id(meeting.host_id)
    update_status(user, meeting.duration, meeting.topic)

    # Don't override preexisting meeting in common space - user probably forget to go home
    # before starting a scheduled meeting.
    return if !user.current_room.office? && user.current_room.meeting_in_progress?

    user.current_room.update_attributes(meeting_id: meeting.id, host_id: meeting.host_id)
    MapNotifier.room_update(user.current_room.id, meeting_id: meeting.id)
    MapNotifier.ghost_user_join(user.id, user.current_room.id) unless user.present

    launch_meeting_for_meeting_participants(user)
  end

  def clear_status(user)
    status_updates =
      if /\s\[.*\]/ =~ user.status
        { status: user.status.sub(/\s\[.*\]/, '') }
      else
        { state: 'available', status: '', back_by: nil }
      end
    user.update_attributes(status_updates)
  end

  def update_status(user, meeting_duration, meeting_topic)
    back_by = (Time.now + meeting_duration.to_i.minutes).in_time_zone(user.timezone)

    status_updates =
      if user.state == 'busy' && user.status.present?
        back_by_message = meeting_duration.to_i.zero? ? '' : " until #{back_by.strftime('%-l:%M%P %Z')}"
        updated_status_message = "#{user.status} [#{meeting_topic}#{back_by_message}]"
        { status: updated_status_message }
      else
        { state: 'busy', status: meeting_topic, back_by: back_by }
      end
    user.update_attributes(status_updates)
  end

  def launch_meeting_for_meeting_participants(host)
    meeting_participants = host.current_room.occupants - [host]
    meeting_participants.each do |participant|
      MapNotifier.join_running_meeting(user: participant.id, meeting_url: host.current_room.meeting_url, room_id: host.current_room.id)
    end
  end
end
