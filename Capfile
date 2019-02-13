# Load DSL and set up stages
require 'capistrano/setup'

# Include default deployment tasks
require 'capistrano/deploy'

# Include console for testing
require 'capistrano/console'

# Load the SCM plugin appropriate to your project:
#
# require 'capistrano/scm/hg'
# install_plugin Capistrano::SCM::Hg
# or
# require 'capistrano/scm/svn'
# install_plugin Capistrano::SCM::Svn
# or
require 'capistrano/scm/git'
install_plugin Capistrano::SCM::Git

# Include tasks from other gems included in your Gemfile
#
# For documentation on these, see for example:
#
#   https://github.com/capistrano/rvm
#   https://github.com/capistrano/rbenv
#   https://github.com/capistrano/chruby
#   https://github.com/capistrano/bundler
#   https://github.com/capistrano/rails
#   https://github.com/capistrano/passenger
#
require 'capistrano/rvm'
require 'capistrano/bundler'
require 'capistrano/puma'
require 'capistrano/rails/assets'
require 'capistrano/rails/migrations'
require 'capistrano/yarn'
require 'capistrano/rails/console'
require 'capistrano/delayed_job'
require 'capistrano/rails/collection'
require 'capistrano/safe_deploy_to'
install_plugin Capistrano::Puma
install_plugin Capistrano::Puma::Nginx

# Load custom tasks from `lib/capistrano/tasks` if you have any defined
Dir.glob('lib/capistrano/tasks/*.rake').each { |r| import r }
