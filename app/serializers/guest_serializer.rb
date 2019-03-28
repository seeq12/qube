class GuestSerializer
  include FastJsonapi::ObjectSerializer
  attributes :first_name, :color, :current_room_id, :is_guest, :present
end
