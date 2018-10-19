class UpdateNames < ActiveRecord::Migration[5.1]
  def change
    rename_column :users, :name, :first_name
    rename_column :guests, :name, :first_name
    add_column    :users, :last_name, :string
  end
end
