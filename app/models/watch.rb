# == Schema Information
#
# Table name: watches
#
#  id          :bigint(8)        not null, primary key
#  watching_id :integer          not null
#  watcher_id  :integer          not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_watches_on_watcher_id                  (watcher_id)
#  index_watches_on_watching_id                 (watching_id)
#  index_watches_on_watching_id_and_watcher_id  (watching_id,watcher_id) UNIQUE
#

class Watch < ApplicationRecord
  belongs_to :watcher, foreign_key: 'watcher_id', class_name: 'User'
  belongs_to :watching, foreign_key: 'watching_id', class_name: 'User'
end
