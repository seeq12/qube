ReminderJob = Struct.new(:user) do
  REMINDERS ||= ["Hey! It's been awhile - are you back in the office?",
                 "Pssst. You were supposed to be back awhile ago. Don't worry, I don't think anyone's noticed.",
                 "Taking an extra long siesta? Hey, I won't tell ;)",
                 'Are you back yet? Are you back yet? How about now?',
                 "I know you're coming back... BUT WHEN??!!",
                 "It's not like I've been waiting for you to come back or anything, but...",
                 "You've been gone for so long I CAN'T EVEN REMEMBER WHAT YOU LOOK LIKE ANYMORE"]
  ATTACHMENTS ||= [{ text: '', callback_id: 'slack', style: 'primary', attachment_type: 'default', actions: [{ name: 'back', text: "I'm back!", type: 'button', value: true }] }].to_json

  def perform
    SlackNotifier.notify(user, REMINDERS.sample, ATTACHMENTS) unless user.free?
    user.update_attributes(job_id: nil)
  end
end
