class RoomSerializer
  include FastJsonapi::ObjectSerializer
  attributes :name, :owner_id, :floorplan_id, :floor_id, :meeting_id, :room_type, :slack_url
end
