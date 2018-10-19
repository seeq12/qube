class CreateGuests < ActiveRecord::Migration[5.1]
  def change
    create_table :guests do |t|
      t.string :name
      t.string :color
      t.integer :current_room_id

      t.timestamps
    end
  end
end
