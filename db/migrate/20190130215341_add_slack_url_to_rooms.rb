class AddSlackUrlToRooms < ActiveRecord::Migration[5.1]
  def change
    add_column :rooms, :slack_url, :string
  end
end
