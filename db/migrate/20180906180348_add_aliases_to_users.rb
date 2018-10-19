class AddAliasesToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :aliases, :text
  end
end
