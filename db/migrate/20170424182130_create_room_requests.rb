class CreateRoomRequests < ActiveRecord::Migration[5.0]
  def change
    create_table :room_requests do |t|
      t.integer :room_id
      t.integer :requester_id
      t.integer :entrant_id
      t.timestamp :accepted_at

      t.timestamps
    end
  end
end
