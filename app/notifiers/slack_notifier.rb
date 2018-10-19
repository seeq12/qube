class SlackNotifier
  def self.notify(user, message, attachments = [])
    client = Slack::Web::Client.new(token: user.slack_token)
    channel_id = client.im_open(user: user.uid).channel.id
    client.chat_postMessage(channel: channel_id, text: message, attachments: attachments)
  end
end
