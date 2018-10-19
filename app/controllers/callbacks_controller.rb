class CallbacksController < Devise::OmniauthCallbacksController
  def slack
    @user = User.from_omniauth(request.env['omniauth.auth'])
    redirect_to root_path(zoom: false) and return if @user.nil?

    @user.remember_me = true

    sign_in_and_redirect @user and return if @user.new_record? && @user.save

    return root_path unless @user.persisted?

    @user.update_attributes(endpoint: nil, p256dh: nil, auth: nil)

    MapNotifier.user_update(@user.slice(:id, :current_room_id, :last_room_entered_at))
    sign_in_and_redirect @user
  end
end
