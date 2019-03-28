class Meeting
  include ActiveAttr::Model
  attr_accessor :id, :host_id, :type, :topic, :duration, :error, :status, :room

  def initialize(params)
    super(params)
    return if id.nil? || host_id.nil?

    self.attributes = Zoomus.new.meeting_get(host_id: host_id, id: id) unless duration.present?
    self.room = Room.find_by(meeting_id: id) unless room.present?
  end

  def managed_by_qube?
    room.present?
  end

  def scheduled?
    type == 2 || type == 8
  end

  def started?
    return false if error.present?
    status.present? && status > 0
  end

  def self.launch_for_host(room, host)
    meeting = Zoomus.new.meeting_create(host_id: host.zoom_host_id, topic: room.name, type: !room.office? && host.use_pmi ? 2 : 1, option_use_pmi: !room.office? && host.use_pmi)

    room.update_attributes(meeting_id: meeting['id'], host_id: host.zoom_host_id)
    MapNotifier.launch_meeting(room_id: room.id, user: host.id, meeting_url: meeting['start_url'], meeting_id: meeting['id'])

    meeting['start_url']
  end

  def self.send_warning_info(room, host)
    host_message = "We're having difficulty starting your meeting! Try clicking 'start meeting'."
    WebpushNotifier.notify(host, host_message)

    participants = room.occupants - [host]
    participant_message = "It's taking awhile for #{host.name} to start the meeting, please wait..."
    participants.each { |participant| WebpushNotifier.notify(participant, participant_message) }
  end

  def self.send_error_info(room, host)
    host_message = "We can't start your meeting! We're not sure what happened :("
    WebpushNotifier.notify(host, host_message)

    MapNotifier.spinner_error(room.id)
    participants = room.occupants - [host]
    participant_message = "We're not sure what happened to #{host.name}! You might want to follow up with #{host.name}."
    participants.each { |participant| WebpushNotifier.notify(participant, participant_message) }
  end

  def self.start_with_nudges(nudges, previous_try_count, room, host_id, meeting_url, entrant = nil)
    nudges.times do |try_count|
      (nudges * 2).times do
        return true if launch_for_participants(room, entrant)
        sleep 0.5
      end

      MapNotifier.relaunch_meeting(user: host_id, room_id: room.id, meeting_url: meeting_url, try_count: previous_try_count + try_count + 1)
    end

    false
  end

  def self.launch_for_participants(room, entrant)
    meeting = Meeting.new(host_id: room.host_id, id: room.meeting_id, room: room)
    return false unless meeting.started?

    participants = entrant.present? ? [entrant] : room.occupants.where.not(id: room.host_id)
    participants.each do |participant|
      MapNotifier.join_meeting(room_id: room.id, user: participant.id, meeting_url: "#{room.meeting_url}")
    end
    true
  end
end
