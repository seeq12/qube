# == Schema Information
#
# Table name: guests
#
#  id              :bigint(8)        not null, primary key
#  first_name      :string(255)
#  color           :string(255)
#  current_room_id :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_guests_on_current_room_id  (current_room_id)
#

class Guest < ApplicationRecord
  belongs_to :current_room, class_name: 'Room'

  after_create :update_presence
  after_update :update_room, if: :saved_change_to_current_room_id?
  after_destroy :update_absense

  def update_presence
    MapNotifier.guest_user_join(id, first_name, color, current_room.id)
  end

  def update_room
    MapNotifier.user_update(id: "#{id}_guest", current_room_id: current_room.id)
  end

  def update_absense
    MapNotifier.guest_user_leave(id, first_name, current_room.id)
  end

  def is_guest
    true
  end

  def present
    true
  end
end
