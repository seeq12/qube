json.extract! user, :id, :first_name, :last_name, :current_room_id, :home_id, :state, :status, :back_by, :emotion, :present, :color, :watching_ids, :updated_at, :theme, :admin, :use_pmi, :timezone, :last_room_entered_at, :last_sign_in_at, :email, :department_id, :aliases
json.pinned_rooms do
  json.array! user.pinned_rooms, partial: 'pinned_rooms/pinned_room', as: :pinned_room
end
