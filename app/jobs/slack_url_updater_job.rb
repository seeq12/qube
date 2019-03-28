class SlackUrlUpdaterJob
  include SuckerPunch::Job

  def perform(saved_change_to_current_room_id)
    ActiveRecord::Base.connection_pool.with_connection do
      previous_room = Room.find(saved_change_to_current_room_id.first)
      current_room = Room.find(saved_change_to_current_room_id.last)

      previous_room.update_attributes(slack_url: previous_room.generate_slack_url)
      current_room.update_attributes(slack_url: current_room.generate_slack_url)
    end
  end
end
