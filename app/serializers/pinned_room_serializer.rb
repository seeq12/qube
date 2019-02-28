class PinnedRoomSerializer
  include FastJsonapi::ObjectSerializer
  attributes :position_id, :room_id
end
