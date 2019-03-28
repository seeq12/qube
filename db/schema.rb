# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20190130215341) do

  create_table "delayed_jobs", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "priority", default: 0, null: false
    t.integer "attempts", default: 0, null: false
    t.text "handler", null: false
    t.text "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string "locked_by"
    t.string "queue"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["priority", "run_at"], name: "delayed_jobs_priority"
  end

  create_table "departments", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "floors", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string "name"
    t.integer "level"
    t.integer "size"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "guests", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string "first_name"
    t.string "color"
    t.integer "current_room_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["current_room_id"], name: "index_guests_on_current_room_id"
  end

  create_table "pinned_rooms", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "user_id"
    t.integer "position_id"
    t.integer "room_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["room_id"], name: "index_pinned_rooms_on_room_id"
    t.index ["user_id"], name: "index_pinned_rooms_on_user_id"
  end

  create_table "room_requests", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "room_id"
    t.integer "requester_id"
    t.integer "entrant_id"
    t.datetime "accepted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "acceptable_from_room"
    t.bigint "acceptable_from_room_id"
    t.index ["acceptable_from_room_id"], name: "index_room_requests_on_acceptable_from_room_id"
    t.index ["entrant_id"], name: "index_room_requests_on_entrant_id"
    t.index ["requester_id"], name: "index_room_requests_on_requester_id"
    t.index ["room_id"], name: "index_room_requests_on_room_id"
  end

  create_table "rooms", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string "name"
    t.integer "floorplan_id"
    t.integer "owner_id"
    t.string "meeting_id"
    t.string "host_id"
    t.string "room_type"
    t.integer "max_occupancy"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "floor_id"
    t.string "slack_url"
    t.index ["floor_id"], name: "index_rooms_on_floor_id"
    t.index ["owner_id"], name: "index_rooms_on_owner_id"
  end

  create_table "settings", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.boolean "admin_mode", default: false
    t.boolean "self_registration", default: false
    t.string "company_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string "first_name"
    t.boolean "present", default: true
    t.string "state"
    t.string "status"
    t.datetime "back_by"
    t.string "timezone"
    t.boolean "use_pmi", default: false
    t.text "slack_dms"
    t.string "color"
    t.string "emotion"
    t.string "theme"
    t.integer "current_room_id"
    t.boolean "admin", default: false
    t.datetime "last_room_entered_at"
    t.datetime "last_watched_timestamp"
    t.string "slack_token"
    t.string "zoom_host_id"
    t.string "endpoint"
    t.string "p256dh"
    t.string "auth"
    t.string "job_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "email"
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "unique_session_id", limit: 20
    t.string "provider"
    t.string "uid"
    t.integer "score"
    t.datetime "last_offline"
    t.text "aliases"
    t.integer "department_id"
    t.string "last_name"
    t.index ["current_room_id"], name: "index_users_on_current_room_id"
    t.index ["department_id"], name: "index_users_on_department_id"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["provider"], name: "index_users_on_provider"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["uid"], name: "index_users_on_uid"
  end

  create_table "watches", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.integer "watching_id", null: false
    t.integer "watcher_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["watcher_id"], name: "index_watches_on_watcher_id"
    t.index ["watching_id", "watcher_id"], name: "index_watches_on_watching_id_and_watcher_id", unique: true
    t.index ["watching_id"], name: "index_watches_on_watching_id"
  end

  add_foreign_key "room_requests", "rooms", column: "acceptable_from_room_id"
end
