# config valid only for current version of Capistrano
lock '3.10.2'

set :application, 'qube'
set :repo_url, 'git@github.com:seeq12/qube.git'
# This is the server folder where qube will be deployed to. You will only want to change this if you
# host on a non-AWS server or cloud hosting platform.
set :deploy_to, '/home/ubuntu/qube'

# Default value for :pty is false
set :pty, true

# Default value for :linked_files is []
set :linked_files, %w(config/database.yml config/secrets.yml)

# Default value for linked_dirs is []
set :linked_dirs, %w(log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system public/uploads)

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

## Defaults:
# set :scm,           :git
# set :branch,        :master
# set :branch,        'develop'
# set :format,        :pretty
# set :log_level,     :debug
# set :keep_releases, 5

set :default_env, { 'RAILS_ENV' => 'production' }
set :stage,           :production
set :deploy_via,      :remote_cache
# set :puma_threads,    [4, 16]
# set :puma_workers,    0
set :ssh_options,     { forward_agent: true, user: fetch(:user), keys: %w(~/.ssh/id_rsa.pub) }
set :puma_init_active_record, true # Change to false when not using ActiveRecord
set :nginx_use_ssl, true

namespace :deploy do
  desc 'Make sure local git is in sync with remote.'
  task :check_revision do
    on roles(:app) do
      unless `git rev-parse HEAD` == `git rev-parse origin/#{fetch(:branch)}`
        puts "WARNING: HEAD is not the same as origin/#{fetch(:branch)}"
        puts 'Run `git push` to sync changes.'
        exit
      end
    end
  end

  desc 'Reload the database with seed data'
  task seed: [:set_rails_env] do
    on primary fetch(:migration_role) do
      within release_path do
        with rails_env: fetch(:rails_env) do
          execute :rake, 'db:seed'
        end
      end
    end
  end

  before :starting, :check_revision
  after 'deploy:migrate', 'deploy:seed'
end

# ps aux | grep puma    # Get puma pid
# kill -s SIGUSR2 pid   # Restart puma
# kill -s SIGTERM pid   # Stop puma
