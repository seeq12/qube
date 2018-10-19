class CreatePinnedRooms < ActiveRecord::Migration[5.1]
  def change
    create_table :pinned_rooms do |t|
      t.integer :user_id
      t.integer :position_id
      t.integer :room_id

      t.timestamps
    end
  end
end
