class AddLastOfflineToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :last_offline, :datetime
  end
end
