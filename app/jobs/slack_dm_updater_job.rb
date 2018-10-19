class SlackDMUpdaterJob
  include SuckerPunch::Job

  def perform(user_id, slack_token)
    client = Slack::Web::Client.new(token: slack_token)
    everyone_else = User.all.where.not(id: user_id).where.not(uid: nil)

    slack_dms = {}
    everyone_else.find_each do |other|
      channel_id = client.im_open(user: other.uid).channel.id

      slack_dms[other.id] = channel_id

      other_slack_dms = JSON.parse(other.slack_dms)
      other_slack_dms[user_id] = channel_id
      other.update_attributes(slack_dms: other_slack_dms.to_json)
      sleep 0.20 # to avoid slack rate limits
    end

    user = User.find(user_id)
    channel_id = client.im_open(user: user.uid).channel.id
    slack_dms[user_id] = channel_id

    user.update_attributes(slack_dms: slack_dms.to_json)
  end
end
