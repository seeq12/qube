# Create offices, common spaces, and conferences rooms on first setup
num_floors = Floor.office_size(Rails.application.secrets.num_offices)
floor_size = Floor.floorplan_size(Rails.application.secrets.num_offices / num_floors)

num_floors.times do |floor|
  Floor.where(level: floor + 1).first_or_create(name: Faker::Space.star_cluster, size: floor_size)
end

# Clean up old Room Requests on upgrade
RoomRequest.where('created_at < ?', (Time.now - 7.days)).destroy_all
