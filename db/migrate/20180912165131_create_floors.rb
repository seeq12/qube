class CreateFloors < ActiveRecord::Migration[5.1]
  def change
    create_table :floors do |t|
      t.string :name
      t.integer :level
      t.integer :size

      t.timestamps
    end
  end
end
