class CreateSettings < ActiveRecord::Migration[5.1]
  def change
    create_table :settings do |t|
      t.boolean :admin_mode, default: false
      t.boolean :self_registration, default: false
      t.string  :company_name

      t.timestamps
    end
  end
end
