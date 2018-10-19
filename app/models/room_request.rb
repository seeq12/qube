# == Schema Information
#
# Table name: room_requests
#
#  id                      :bigint(8)        not null, primary key
#  room_id                 :integer
#  requester_id            :integer
#  entrant_id              :integer
#  accepted_at             :datetime
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  acceptable_from_room    :integer
#  acceptable_from_room_id :bigint(8)
#
# Indexes
#
#  index_room_requests_on_acceptable_from_room_id  (acceptable_from_room_id)
#  index_room_requests_on_entrant_id               (entrant_id)
#  index_room_requests_on_requester_id             (requester_id)
#  index_room_requests_on_room_id                  (room_id)
#

class RoomRequest < ApplicationRecord
  belongs_to :room
  belongs_to :acceptable_from_room, class_name: 'Room', foreign_key: 'acceptable_from_room_id'
  belongs_to :requester, class_name: 'User', foreign_key: 'requester_id'
  belongs_to :entrant, class_name: 'User', foreign_key: 'entrant_id'

  def knock?
    requester == entrant
  end

  def invite?
    requester != entrant
  end

  def to_s
    room_belongs_to = room.owner.present? ? " (office of #{room.owner.name})" : ''
    return "#{requester.name} requested access to #{room.name}#{room_belongs_to}." if knock?
    "#{requester.name} invited #{entrant.name} to #{room.name}#{room_belongs_to}."
  end

  def self.history(count = 10)
    RoomRequest.last(count).map { |r| "#{r.created_at.in_time_zone('America/Los_Angeles').strftime('%-m/%-e %-l:%M%P %Z')}: #{r}" }
  end
end
