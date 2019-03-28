require 'faker'

# == Schema Information
#
# Table name: floors
#
#  id         :bigint(8)        not null, primary key
#  name       :string(255)
#  level      :integer
#  size       :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Floor < ApplicationRecord
  has_many :rooms, dependent: :destroy

  before_validation :round_floorsize

  validates_presence_of :name, :level, :size
  validates :level, numericality: { greater_than: 0 }
  validate :size_increased
  after_save :grow, if: :saved_change_to_size?
  after_create :update_everyone
  after_update :update_everyone, if: :public_attribute_changed?
  after_destroy :notify_destroy

  NOTIFIABLE_FIELDS = [:name, :level, :size]
  FLOORPLAN_SIZES = [10, 25, 35, 45, 54, 66]
  RANDOM_GENERATORS = ["Faker::Space.nebula.gsub(' Nebula', '')", "Faker::Space.constellation", "Faker::Space.moon", "Faker::Superhero.name", "Faker::Superhero.power", "Faker::Dessert.topping", "Faker::Dessert.flavor", "Faker::Hacker.noun"]

  def self.office_size(min_offices)
    (min_offices / Floor::FLOORPLAN_SIZES.max.to_f).ceil
  end

  def self.floorplan_size(min_offices)
    FLOORPLAN_SIZES.select { |size| size >= [FLOORPLAN_SIZES.max, min_offices].min }.min
  end

  def grow
    Room::SPECIAL_ROOMS.each do |room|
      Room.where(floor: self, floorplan_id: room[3]).first_or_create(name: "#{random_name} #{room[0]}", room_type: room[1], max_occupancy: room[2])
    end

    special_room_ids = Room::SPECIAL_ROOMS.map(&:last)
    (size + Room::SPECIAL_ROOMS.count).times.reject { |id| special_room_ids.include? id }.each do |i|
      Room.where(floor: self, floorplan_id: i).first_or_create(name: random_name, room_type: 'office', max_occupancy: 4)
    end

    MapNotifier.refresh
  end

  def size_increased
    return unless size
    if size > FLOORPLAN_SIZES.max
      errors[:base] << "Whoa, #{size}? This office is not in a pocket dimension. You'll have to add two smaller floors like everyone else."
    end

    return unless size_was && size < size_was
    errors[:base] << "Hey, you can't just hack off an existing floor! Start over with a new floor if you'd like to cut back on office space." if size_was && size < size_was
  end

  def round_floorsize
    return unless will_save_change_to_size?
    self.size = Floor.floorplan_size(size) if size && size < FLOORPLAN_SIZES.max
  end

  private

  def public_attribute_changed?
    persisted? && NOTIFIABLE_FIELDS.any? { |k| saved_changes.key?(k) }
  end

  def update_everyone
    params = saved_changes.map { |k, v| [k.to_sym, v.last] }.to_h.slice(*NOTIFIABLE_FIELDS).merge(id: id)
    MapNotifier.floor_update(params)
  end

  def notify_destroy
    MapNotifier.destroy_floor(id)
  end

  def random_name
    @@index ||= 0
    begin
      eval(RANDOM_GENERATORS[@@index])
    rescue Faker::UniqueGenerator::RetryLimitExceeded => e
      @@index += 1
      eval(RANDOM_GENERATORS[@@index])
    end
  end
end
