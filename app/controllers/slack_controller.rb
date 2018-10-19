require 'rounding'

class SlackController < ApplicationController
  BACK_RESPONSES ||= ['Great to have you back! Now get working ;)',
                      'Awesome! It\'s going to be a great rest of the day.',
                      'Happy to see you! The office hasn\'t been the same without you.']
  STATE_ACTIONS ||= { name: 'state', text: 'Update your state', type: 'select', options: [{ text: 'available', value: 'available' }, { text: 'Feeling social', value: 'Feeling social' }, { text: 'BRB', value: 'BRB' }, { text: 'busy', value: 'busy' }, { text: 'away', value: 'away' }] }
  SUBMIT_ACTIONS ||= [{ name: 'submit', text: 'Looks good!', style: 'primary', type: 'button', value: 0 }, { name: 'submit', text: 'Cancel', type: 'button', value: 1 }]

  HELP_ATTACHMENTS ||=
    [{ text: '/qube {status}    - Update your status. Entering a status will present options for changing your state or back by time.'\
              "\n/qube watching - See the list of people you\'re watching."\
              "\n/qube watchers - See a list of people who are watching you."\
              "\n/qube help        - You\'ve already learned how to get help! ;)" }]

  def accept
    payload = JSON.parse(request.parameters['payload'])
    user = User.find_by_uid(JSON.parse(request.parameters['payload'])['user']['id'])

    case payload['actions'].first['name']
    when 'back'
      user.update_attributes(state: 'available', status: '', back_by: nil)
      render json: { text: BACK_RESPONSES.sample, 'replace_original': true }
    when 'state'
      state = payload['actions'].first['selected_options'].first['value']
      render json: rebuild_state(payload['original_message'], state, user)
    when 'back_by'
      back_by = payload['actions'].first['selected_options'].first['value']
      render json: rebuild_back_by(payload['original_message'], back_by)
    when 'submit'
      render json: { 'delete_original': true } and return unless payload['actions'].first['value'].to_i.zero?

      state = payload['original_message']['attachments'][0]['actions'].first['selected_options'].first['value']
      back_by =
        if payload['original_message']['attachments'][1]['actions'].first['selected_options'].present?
          payload['original_message']['attachments'][1]['actions'].first['selected_options'].first['value']
        end

      update_back_by(user, state, back_by)
      render json: { text: "Great! You've been set to #{user.state} in qube, with the status '#{user.slack_status}'.", 'replace_original': true }
    else
      render json: {}
    end
  end

  def command
    user = User.find_by_uid(request.parameters['user_id'])

    case request.parameters['text']
    when 'watching'
      text = user.watching.empty? ? "You're not watching anyone." : "You're watching #{user.watching.pluck(:first_name).to_sentence}."
      render json: { 'response_type': 'ephemeral', text: text } and return
    when 'watchers'
      text = user.watchers.empty? ? "You're not being watched by anyone." : "You're being watched by #{user.watchers.pluck(:first_name).to_sentence}."
      render json: { 'response_type': 'ephemeral', text: text } and return
    when 'help'
      render json: { 'response_type': 'ephemeral', text: 'How to use /qube', attachments: HELP_ATTACHMENTS } and return
    else
      update_status_slack(user, request.parameters['text'])
    end
    head :ok
  end

  private

  def update_back_by(user, state, back_by)
    user.clear_back_by_reminder

    params = { state: state }
    params[:back_by] =
      if (state == 'BRB' || state == 'away') && back_by.present?
        user.schedule_back_by_reminder(Time.parse(back_by))
        back_by
      end

    user.update_attributes(params)
  end

  def update_status_slack(user, status)
    user.update_attributes(status: status)

    message = "Thanks! I've updated your qube status to '#{user.slack_status}'."
    state = build_state([{ text: user.state, value: user.state }])
    action_buttons = { fallback: 'Submit buttons', callback_id: 'submit', style: 'primary', attachment_type: 'default', actions: SUBMIT_ACTIONS }
    attachments = [state, action_buttons]
    attachments = attachments.insert(1, build_back_by(user)) if user.state == 'BRB' || user.state == 'away'

    client = Slack::Web::Client.new(token: user.slack_token)
    channel_id = client.im_open(user: user.uid).channel.id
    client.chat_postMessage(channel: channel_id, text: message, attachments: attachments.to_json)
  end

  def build_state(selected_options)
    state_actions_copy = STATE_ACTIONS.clone
    state_actions_copy['selected_options'] = selected_options

    { text: 'Need to update your state as well?', fallback: 'Update state', callback_id: 'command', attachment_type: 'default', actions: [state_actions_copy] }
  end

  def build_back_by(user)
    # round up to next 15min, unless already too close to the 15min mark
    base_time = (Time.now.in_time_zone(user.timezone) + 5.minutes).ceil_to(60 * 15)
    times = build_back_by_times(user, base_time)

    back_by_field = { callback_id: 'back_by', fallback: 'Update back by', attachment_type: 'default', id: 3, actions: [{ id: '3', name: 'back_by', text: 'Update back by time', type: 'select', options: times.map { |t| { text: t.strftime('%-l:%M%P'), value: t.to_s }.stringify_keys } }.stringify_keys] }.stringify_keys

    if user.back_by.present?
      back_by_field['actions'].first['selected_options'] = [{ text: user.back_by.in_time_zone(user.timezone).strftime('%-l:%M%P'), value: user.back_by }.stringify_keys]
    end

    back_by_field
  end

  def build_back_by_times(user, base_time)
    times = [base_time,
             (base_time + 1.minutes).ceil_to(60 * 15),
             (base_time + 16.minutes).ceil_to(60 * 15),
             (base_time + 31.minutes).ceil_to(60 * 15),
             (base_time + 46.minutes).ceil_to(60 * 15),
             (base_time + 46.minutes).ceil_to(60 * 60),
             (base_time + 76.minutes).ceil_to(60 * 30),
             (base_time + 106.minutes).ceil_to(60 * 30),
             (base_time + 136.minutes).ceil_to(60 * 60),
             (base_time + 196.minutes).ceil_to(60 * 60),
             (base_time + 4.hours).ceil_to(60 * 60),
             (base_time + 5.hours).ceil_to(60 * 60)]
    times << user.back_by.in_time_zone(user.timezone) if user.back_by.present?
    times.sort.uniq
  end

  def rebuild_state(original, state, user)
    original['attachments'][0]['actions'].first['selected_options'] = [{ text: state, value: state }.stringify_keys]
    if %w(BRB away).include? state
      if original['attachments'].size == 2
        original['attachments'] = original['attachments'].insert(1, build_back_by(user))
      end
    elsif original['attachments'].size == 3
      original['attachments'].delete_at(1)
    end

    original
  end

  def rebuild_back_by(original, back_by)
    original['attachments'][1]['actions'].first['selected_options'] = [{ text: Time.parse(back_by).strftime('%-l:%M%P'), value: back_by }.stringify_keys]
    original
  end
end
