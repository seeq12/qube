class AddAcceptableFromRoomToRoomRequests < ActiveRecord::Migration[5.1]
  def change
    add_reference :room_requests, :acceptable_from_room, foreign_key: { to_table: :rooms }, type: :integer
  end
end
