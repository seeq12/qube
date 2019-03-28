require 'faker'

EMOTIONS = ['flaticon-happy-4', 'flaticon-happy', 'flaticon-happy-1', 'flaticon-happy-2', 'flaticon-happy-5', 'flaticon-happy-6', 'flaticon-giggle',
            'flaticon-pirate', 'flaticon-pirate-1', 'flaticon-pirate-2', 'flaticon-pirate-3', 'flaticon-pirate-4', 'flaticon-looking-1', 'flaticon-nerd',
            'flaticon-happy', 'flaticon-looking-2', 'flaticon-sad-2', 'flaticon-shocked', 'flaticon-shocked-2', 'flaticon-shocked-1', 'flaticon-shocked-3',
            'flaticon-bored', 'flaticon-bored-1', 'flaticon-crying', 'flaticon-dead', 'flaticon-goofy-3', 'flaticon-wink', 'flaticon-sad', 'flaticon-sad-1',
            'NONE']

def random_quote
  quote = [Faker::HarryPotter.quote, Faker::HitchhikersGuideToTheGalaxy.marvin_quote, Faker::FamousLastWords.last_words, Faker::GameOfThrones.quote, Faker::MichaelScott.quote, Faker::SiliconValley.quote, Faker::SiliconValley.motto].sample.truncate(150)
  [quote, '', ''].sample
end

num_offices = rand(10..50)

num_floors = Floor.office_size(num_offices)
floor_size = Floor.floorplan_size(num_offices / num_floors)

puts "Adding #{num_floors} floors"
num_floors.times do |floor|
  Floor.where(level: floor + 1).first_or_create(name: Faker::Space.star_cluster, size: floor_size)
end

Setting.instance.update_attributes(company_name: Faker::Company.name, self_registration: true)

num_departments = rand(1..15)
puts "Adding #{num_departments} departments"
num_departments.times do
  Department.create(name: Faker::Company.industry)
end

num_users_with_office = rand(((num_offices * 0.7).round)..num_offices)
puts "Adding #{num_users_with_office} users with offices"
num_users_with_office.times do
  user = User.new(first_name: Faker::Name.first_name, last_name: Faker::Name.last_name, present: Faker::Boolean.boolean(0.75), state: User::STATES.sample,
                  status: random_quote, home: Room.where(owner: nil, room_type: 'office').limit(1).order('RAND()').first,
                  department: Department.limit(1).order('RAND()').first, theme: 'default', color: SecureRandom.hex(3),
                  password: Devise.friendly_token[0, 20], emotion: EMOTIONS.sample, last_sign_in_at: Time.now)
  user.email = Faker::Internet.email(user.first_name)
  random_room = Room.find_by_sql('select rooms.* from rooms inner join users on rooms.owner_id = users.id where users.present = 1 and rooms.id = users.current_room_id').sample
  user.current_room = [user.home, Room.next_open_room, random_room].sample
  user.back_by = Faker::Time.forward(1, :day) unless user.free?
  user.save!
end

num_homeless_users = rand(0..15)
puts "Adding #{num_homeless_users} users without offices"
num_homeless_users.times do
  user = User.new(first_name: Faker::Name.first_name, last_name: Faker::Name.last_name, present: Faker::Boolean.boolean, state: User::STATES.sample,
                  status: random_quote, department: Department.limit(1).order('RAND()').first, theme: 'default', color: SecureRandom.hex(3),
                  password: Devise.friendly_token[0, 20], emotion: EMOTIONS.sample, last_sign_in_at: Time.now)
  user.email = Faker::Internet.email(user.first_name)
  random_room = Room.find_by_sql('select rooms.* from rooms inner join users on rooms.owner_id = users.id where users.present = 1 and rooms.id = users.current_room_id').sample
  user.current_room = [Room.next_open_room, random_room].sample
  user.back_by = Faker::Time.forward(1, :day) unless user.free?
  user.save!
end

num_guests = rand(2..15)
puts "Adding #{num_guests} guests"
num_guests.times do
  random_room = Room.find_by_sql('select rooms.* from rooms inner join users on rooms.owner_id = users.id where users.present = 1 and rooms.id = users.current_room_id').sample
  current_room = [Room.next_open_room, random_room].sample

  Guest.create(first_name: Faker::Name.first_name, color: SecureRandom.hex(3), current_room: current_room)
end
