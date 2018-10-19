class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  respond_to :html, :json

  skip_before_action :verify_authenticity_token
  before_action :verify_presence

  def qube
    @current_user = current_user
    render 'layouts/application'
  end

  def after_sign_out_path_for(_resource)
    root_path
  end

  private

  def verify_presence
    return if current_user.nil? || current_user.present

    current_user.update_attributes(present: true)
    MapNotifier.user_presence(current_user.id, true)
  end
end
