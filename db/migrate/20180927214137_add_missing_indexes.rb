class AddMissingIndexes < ActiveRecord::Migration[5.1]
  def change
    add_index :guests, :current_room_id
    add_index :pinned_rooms, :room_id
    add_index :pinned_rooms, :user_id
    add_index :room_requests, :entrant_id
    add_index :room_requests, :requester_id
    add_index :room_requests, :room_id
    add_index :rooms, :floor_id
    add_index :rooms, :owner_id
    add_index :users, :current_room_id
    add_index :users, :department_id
  end
end
