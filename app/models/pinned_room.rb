# == Schema Information
#
# Table name: pinned_rooms
#
#  id          :bigint(8)        not null, primary key
#  user_id     :integer
#  position_id :integer
#  room_id     :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_pinned_rooms_on_room_id  (room_id)
#  index_pinned_rooms_on_user_id  (user_id)
#

class PinnedRoom < ApplicationRecord
  belongs_to :user
  belongs_to :room

  validates_presence_of :user, :room, :position_id
  validates_uniqueness_of :position_id, scope: [:user_id]
  validates_uniqueness_of :room_id, scope: [:user_id]
  validate :reasonableness

  private

  def reasonableness
    errors[:base] << "You'll need your own office before you can star someone else's office!" unless user.home.present?
    errors[:base] << "#{room.name} is empty! It's not worth starring." if room.owner.nil?
    errors[:base] << "You're special but you can't star yourself!" if user.home == room
    errors[:base] << "#{room.name} is on your floor! Seriously?" if user.home.present? && user.home.floor.level == room.floor.level
  end
end
