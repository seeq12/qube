# == Schema Information
#
# Table name: departments
#
#  id         :bigint(8)        not null, primary key
#  name       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Department < ApplicationRecord
  has_many :users

  validates_presence_of :name
  validates_uniqueness_of :name

  NOTIFIABLE_FIELDS = [:name]

  after_create :update_everyone
  after_update :update_everyone, if: :public_attribute_changed?
  after_destroy :notify_destroy

  private

  def notify_destroy
    MapNotifier.destroy_department(id)
  end

  def public_attribute_changed?
    persisted? && NOTIFIABLE_FIELDS.any? { |k| saved_changes.key?(k) }
  end

  def update_everyone
    params = saved_changes.map { |k, v| [k.to_sym, v.last] }.to_h.slice(*NOTIFIABLE_FIELDS).merge(id: id)
    MapNotifier.department_update(params)
  end
end
