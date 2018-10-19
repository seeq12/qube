class WebpushNotifier
  def self.notify(user, message, type = 'display')
    payload = { message: message, type: type }
    vapid = { subject: 'https://qube.seeq.com', public_key: Rails.application.secrets.webpush_public_key, private_key: Rails.application.secrets.webpush_private_key }

    begin
      Webpush.payload_send(message: payload.to_json, endpoint: user.endpoint, p256dh: user.p256dh, auth: user.auth, vapid: vapid)
    rescue Webpush::InvalidSubscription, Webpush::ExpiredSubscription
      user.update_attributes(unique_session_id: nil)
      MapNotifier.refresh_individual(user.id)
      SlackNotifier.notify(user, "Your browser has rejected qube notifications :/ so we've logged you out to reset your state.")
      raise ArgumentError, "#{user.first_name} #{user.last_name} could not be reached!"
    end
  end

  def self.notify_with_action(user, message, request_id)
    payload = { message: message, id: request_id, type: 'request' }
    vapid = { subject: 'https://qube.seeq.com', public_key: Rails.application.secrets.webpush_public_key, private_key: Rails.application.secrets.webpush_private_key }

    begin
      Webpush.payload_send(message: payload.to_json, endpoint: user.endpoint, p256dh: user.p256dh, auth: user.auth, vapid: vapid)
    rescue Webpush::InvalidSubscription, Webpush::ExpiredSubscription
      user.update_attributes(unique_session_id: nil)
      MapNotifier.refresh_individual(user.id)
      SlackNotifier.notify(user, "Your browser has rejected qube notifications :/ so we've logged you out to reset your state.")
      raise ArgumentError, "#{user.first_name} #{user.last_name} could not be reached!"
    end
  end
end
