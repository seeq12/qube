# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '2.0'

# Add additional assets to the asset load path
Rails.application.config.assets.paths << Rails.root.join('vendor', 'assets')
Rails.application.config.assets.paths << Rails.root.join('vendor', 'assets', 'themes')
Rails.application.config.assets.paths << Rails.root.join('app', 'assets', 'audios')

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
# Rails.application.config.assets.precompile += %w( search.js )
Rails.application.config.assets.precompile << Dir.entries(Rails.root.join('vendor', 'assets', 'themes')).reject { |f| File.directory? f }
Rails.configuration.assets.precompile += %w(serviceworker.js manifest.json)
