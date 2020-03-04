source 'https://rubygems.org'

# securely fetch repos when using insecure bundlers
git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?('/')
  "https://github.com/#{repo_name}.git"
end

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 5.1.0'
gem 'rails-ujs', '~> 5.1.0.beta1'
# Use mysql as the database for Active Record
gem 'mysql2', '~> 0.4.0'

gem 'webpacker', '~> 3.4.1'
# React for view components
gem 'react-rails'

gem 'turbolinks', '~> 5'

# Use Puma as the app server
gem 'puma', '~> 3.12'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails', '~> 4.2'
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby
gem 'bootstrap3-rails'
gem 'moment_timezone-rails'
gem 'momentjs-rails'

gem 'fast_jsonapi'

# user accounts and integration with Slack + Zoom
gem 'devise' # user accounts
gem 'devise_security_extension', git: 'https://github.com/phatworx/devise_security_extension.git'
gem 'omniauth'
gem 'omniauth-slack'
gem 'slack-ruby-client'
gem 'zoomus', git: 'https://github.com/mllocs/zoomus.git'

gem 'active_attr'
gem 'daemons'
gem 'delayed_job_active_record' # delayed job scheduler
gem 'lograge'
gem 'rounding'
gem 'sucker_punch', '~> 2.0' # job scheduler

gem 'faker'
gem 'geocoder'
gem 'open-weather'

gem 'serviceworker-rails'
gem 'webpush'

# Use jquery as the JavaScript library
gem 'jquery-rails'
# Turbolinks makes navigating your web application faster. Read more: https://github.com/turbolinks/turbolinks
# gem 'turbolinks', '~> 5'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.5'
# Use Redis adapter to run Action Cable in production
gem 'redis', '~> 3.0'
gem 'hiredis'
gem 'redis-rails'
# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

gem 'seedbank'

group :development, :test do
  gem 'annotate' # annotates models
  gem 'better_errors'
  gem 'binding_of_caller'
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platform: :mri
end

group :development do
  gem 'capistrano'
  gem 'capistrano-bundler', require: false
  gem 'capistrano-rails', require: false
  gem 'capistrano-rails-collection'
  gem 'capistrano-rails-console', require: false
  gem 'capistrano-rvm'
  gem 'capistrano-yarn'
  gem 'capistrano3-delayed-job', '~> 1.0'
  gem 'capistrano3-puma'
  gem 'capistrano-safe-deploy-to'

  gem 'active_record_doctor'
  gem 'bullet'
  gem 'lol_dba'
  gem 'rubocop'

  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'listen', '~> 3.0.5'
  gem 'web-console', '>= 3.3.0'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
