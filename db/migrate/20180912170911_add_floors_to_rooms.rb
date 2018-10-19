class AddFloorsToRooms < ActiveRecord::Migration[5.1]
  def change
    add_column :rooms, :floor_id, :integer
  end
end
