# == Schema Information
#
# Table name: settings
#
#  id                :bigint(8)        not null, primary key
#  admin_mode        :boolean          default(FALSE)
#  self_registration :boolean          default(FALSE)
#  company_name      :string(255)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

class Setting < ApplicationRecord
  before_create :confirm_singularity
  after_update :update_everyone, if: :public_attribute_changed?

  NOTIFIABLE_FIELDS = [:admin_mode]

  def self.instance
    Setting.first_or_create!
  end

  private

  def public_attribute_changed?
    persisted? && NOTIFIABLE_FIELDS.any? { |k| saved_changes.key?(k) }
  end

  def update_everyone
    params = saved_changes.map { |k, v| [k.to_sym, v.last] }.to_h.slice(*NOTIFIABLE_FIELDS).merge(id: id)
    MapNotifier.setting_update(params)
  end

  def confirm_singularity
    errors.add(:base, 'There can be only one.') and return false if Setting.count > 0
  end
end
