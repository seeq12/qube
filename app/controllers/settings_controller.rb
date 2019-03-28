class SettingsController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_user, except: [:index]

  def index
    settings =
      Rails.cache.fetch("settings", expires_in: 7.days) do
        Setting.instance.to_json
      end

    render json: settings
  end

  def update
    Rails.cache.delete("settings")
    setting = Setting.instance
    if setting.update(setting_params)
      render json: setting.to_json
    else
      render json: { errors: setting.errors.messages }, status: :bad_request
    end
  end

  def master_refresh
    MapNotifier.refresh
    render json: {}
  end

  def master_logout
    User.update_all(unique_session_id: nil)
    MapNotifier.refresh
    render json: {}
  end

  private

  def authorize_user
    return if current_user.admin?
    render json: { errors: "You're not authorized to to take this action!" }, status: :bad_request
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def setting_params
    params.require(:setting).permit(:admin_mode, :company_name, :self_registration)
  end
end
