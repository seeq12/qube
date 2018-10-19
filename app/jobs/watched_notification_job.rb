WatchedNotificationJob = Struct.new(:user) do
  WATCHED_INTROS ||= ["You're a popular person ;)",
                      "You're high in demand!",
                      'This is no time to slack off!',
                      'Feeling lonely?',
                      'Your day is about to get better!',
                      'Do you have a moment?',
                      "Hey.... I know you're busy, but"]

  def perform
    available_watchers = user.watchers.select(&:can_pounce?)
    return unless user.pounceable? && available_watchers.present?

    user.update_attributes(last_watched_timestamp: Time.now)
    SlackNotifier.notify(user, "#{WATCHED_INTROS.sample} #{available_watchers.pluck(:first_name).to_sentence} would like to talk to you.")
  end
end
