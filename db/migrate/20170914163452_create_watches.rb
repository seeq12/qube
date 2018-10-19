class CreateWatches < ActiveRecord::Migration[5.0]
  def change
    create_table :watches do |t|
      t.integer 'watching_id', null: false
      t.integer 'watcher_id', null: false

      t.timestamps
    end

    add_index :watches, [:watching_id, :watcher_id], unique: true
  end
end
