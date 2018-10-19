class SubscriptionsController < ApplicationController
  before_action :authenticate_user!

  def create
    session[:subscription] = params[:subscription]
    endpoint = params[:subscription]['endpoint']
    p256dh = params[:subscription]['keys']['p256dh']
    auth = params[:subscription]['keys']['auth']

    render json: { errors: 'Notification info invalid!' }, status: :bad_request and return unless endpoint.present?
    current_user.update_attributes(endpoint: endpoint, p256dh: p256dh, auth: auth)

    head :ok
  end
end
