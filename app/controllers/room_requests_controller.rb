class RoomRequestsController < ApplicationController
  def accept
    @room_request = RoomRequest.find(request.parameters['room_id'])
    @current_user = User.find(request.parameters['user_id'])

    render json: {} and return unless valid_request?

    OfficeMeetingSchedulerJob.perform_async(@room_request.id, @current_user.id)
    render json: {}
  end

  private

  def valid_request?
    authorized? && !already_accepted? && requester_available? && !expired?
  end

  def already_accepted?
    @room_request.accepted_at.present?
  end

  def expired?
    return false unless @room_request.room.office? && @room_request.created_at.utc < (Time.now - Rails.application.secrets.room_request_expiry_minutes.minutes).utc

    invitation =
      if @room_request.knock?
        "It's been awhile! Inviting #{@room_request.requester.name} to #{current_user.current_room.name}."
      else
        "It's been awhile since #{@room_request.requester.name} invited you! Let's seek entrance to #{@room_request.room.name}."
      end
    WebpushNotifier.notify(current_user, invitation)
    @room_request.knock? ? @current_user.invite(@room_request.requester) : @current_user.knock(@room_request.room)
    true
  end

  def requester_available?
    if !@room_request.requester.present
      WebpushNotifier.notify(current_user, "#{@room_request.requester.name} has left the office!")
      false
    elsif @room_request.invite? && @room_request.requester.current_room != @room_request.room
      WebpushNotifier.notify(current_user, "It's been awhile! Seems like #{@room_request.requester.name} has left #{@room_request.room.name}.")
      false
    elsif @room_request.acceptable_from_room.present? && @room_request.acceptable_from_room != @room_request.requester.current_room
      WebpushNotifier.notify(current_user, "Seems like #{@room_request.requester.name} has moved from #{@room_request.acceptable_from_room.name} to #{@room_request.requester.current_room.name}.")
      false
    else
      true
    end
  end

  def authorized?
    return true if @room_request.knock? && @room_request.room.occupants.include?(current_user)
    return true if @room_request.invite? && @room_request.entrant == current_user
    WebpushNotifier.notify(current_user, 'You\'re not authorized to accept!')
    false
  end
end
