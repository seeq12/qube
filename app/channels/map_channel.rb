class MapChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'map'
    MapNotifier.user_presence(current_user.id, true)

    return if current_user.present
    current_user.update_attributes(present: true)
  end

  def unsubscribed
    current_user.update_attributes(present: false)
    MapNotifier.user_presence(current_user.id, false)
  end
end
