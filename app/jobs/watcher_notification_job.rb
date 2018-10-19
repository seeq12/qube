WatcherNotificationJob = Struct.new(:user) do
  WATCHER_INTROS ||= ['The time has come.',
                      'Are you ready?',
                      'Brace yourself.',
                      'And so it begins.',
                      'Your day is about to get better!',
                      'Time to pounce!',
                      "I'm psyched! Are you?"]

  def perform
    return unless user.pounceable?

    user.watchers.each do |watcher|
      SlackNotifier.notify(watcher, "#{WATCHER_INTROS.sample} #{user.first_name} is now free.") if watcher.present
    end
  end
end
