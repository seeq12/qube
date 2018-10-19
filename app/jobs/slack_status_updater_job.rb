class SlackStatusUpdaterJob
  include SuckerPunch::Job

  def perform(slack_token, slack_status)
    client = Slack::Web::Client.new(token: slack_token)
    current_emoji = client.users_profile_get.profile.status_emoji

    client.users_profile_set(profile: { status_emoji: current_emoji, status_text: slack_status }.to_json)
  end
end
