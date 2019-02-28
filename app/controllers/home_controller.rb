require 'open_weather'

class HomeController < ApplicationController
  before_action :authenticate_user!, only: [:history, :slack_urls, :weather]

  WEATHER_OPTIONS ||= { units: 'metric', APPID: Rails.application.secrets.open_weather_key }
  CONDITIONS ||= {
    'Thunderstorm' => 'RAIN',
    'Drizzle' => 'RAIN',
    'Rain' => 'RAIN',
    'Atmosphere' => 'CLOUDY',
    'Clouds' => 'CLOUDY',
    'Snow' => 'SNOW',
    'Additional' => 'NONE',
    'Extreme' => 'NONE',
    'Clear' => 'NONE'
  }

  def history
    requests = RoomRequest.where(room: current_user.current_room)
                          .or(RoomRequest.where.not(requester: current_user).where(entrant: current_user))
                          .last(10).reverse
    render json: requests.to_json(only: [:created_at], methods: [:to_s])
  end

  def high_score
    render json: User.where.not(score: nil).order(score: :desc).limit(3).select(:first_name, :last_name, :score)
  end

  def slack_urls
    render json: current_user.slack_dms
  end

  def themes
    themes =
      Rails.cache.fetch("qube_themes", expires_in: 7.days) do
        Dir.entries(Rails.root.join('vendor', 'assets', 'themes'))
                    .reject { |f| File.directory? f }
                    .map { |t| t.chomp('.scss') }
                    .sort
                    .map { |t| { theme_name: t, display_name: t.titleize, css_file: ActionController::Base.new.view_context.asset_path("#{t}.css") } }
      end
    render json: { themes: themes }
  end

  def weather
    coordinates = Geocoder.coordinates(current_user.current_sign_in_ip)
    result = OpenWeather::Current.geocode(coordinates[0], coordinates[1], WEATHER_OPTIONS)
    temp = result['main']['temp']
    condition = CONDITIONS[result['weather'].first['main']] || 'NONE'
    sunset = Time.at(result['sys']['sunset']).utc

    render json: { temperature: temp, condition: condition, sunset: sunset }
  rescue NoMethodError
    render json: { temperature: rand(100), condition: CONDITIONS.values.uniq.sample }
  end

  def monitor
    begin
      MonitorJob.new.perform()
    rescue StandardError => e
      render json: { errors: "SuckerPunch MySQL connection dropped, redeploy or restart!" }, status: :bad_request and return
    end
    render json: {}
  end
end
