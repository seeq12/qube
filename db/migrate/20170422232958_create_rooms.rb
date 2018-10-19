class CreateRooms < ActiveRecord::Migration[5.0]
  def change
    create_table :rooms do |t|
      t.string :name
      t.integer :floorplan_id
      t.integer :owner_id
      t.string :meeting_id
      t.string :host_id
      t.string :room_type
      t.integer :max_occupancy

      t.timestamps
    end
  end
end
