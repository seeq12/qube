class CreateUsers < ActiveRecord::Migration[5.0]
  def change
    create_table :users do |t|
      t.string :name
      t.boolean :present, default: true
      t.string :state
      t.string :status
      t.datetime :back_by
      t.string :timezone
      t.boolean :use_pmi, default: false
      t.text :slack_dms
      t.string :color
      t.string :emotion
      t.string :theme
      t.integer :current_room_id
      t.boolean :admin, default: false
      t.datetime :last_room_entered_at
      t.datetime :last_watched_timestamp
      t.string :slack_token
      t.string :zoom_host_id
      t.string :endpoint
      t.string :p256dh
      t.string :auth
      t.string :job_id

      t.timestamps
    end
  end
end
