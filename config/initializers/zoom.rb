Zoomus.configure do |config|
  config.api_key = Rails.application.secrets.zoom_api_key
  config.api_secret = Rails.application.secrets.zoom_api_secret
end
