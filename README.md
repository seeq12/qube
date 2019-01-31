# Qube

Qube is a virtual office that enables you to work remotely! It connects with Slack (a chat-based collaboration tool) and Zoom (a video and audio conferencing tool) to provide an effective virtual office experience. Qube provides office context - who's talking to who, who's out of the office and who just stepped out to lunch.

![qube](qube.png)

### Prerequisites

Qube requires
- [Slack](https://slack.com/). Sign up for the free Slack tier if your company does not currently use Slack.
- [Zoom](https://zoom.us/) accounts. Note that a single Pro Zoom user ($15/mo) is enough to get started with Qube; you may want to upgrade to Pro accounts for users if you find that Qube is heavily used. Get started with a free Pro trial for three months.
- A SSH-enabled server, domain, and https certificates. An AWS image is available with all dependencies (git, ruby, rails, redis, mysql, and yarn) preinstalled for your convenience; if you host elsewhere you will need to install all dependencies yourself.
- A Linux or OSX machine to download Qube, configure your company's custom office, and manage deployments.

Does that sound complicated? It's not, we promise! Contact us at qube@seeq.com and we'll help you get set up.

## Getting Started

These instructions will get you a copy of qube up and running on your local machine and deployed onto an AWS server. Note that you must download the code locally and configure server/office options before deploying to a server.

### Installing

1. Install Ruby/Rails by following the instructions [here](http://installrails.com/).
2. Download a copy of qube's source code (`git clone QUBE`)
3. Install application dependencies by running `bundle install`. This may take awhile.
3. Install yarn (`brew install yarn`) and run `yarn install`.
4. Copy secrets.yml.example into a file called secrets.yml. This will be the source of your secret keys, server configuration, and office configuration settings. DO NOT distribute this file or add it to repository.

## Zoom setup

4a. Visit https://developer.zoom.us/me/ and enable API usage. Copy your API Key and API Secret and paste into secrets.yml (zoom_api_key and zoom_api_secret under shared).
4b. Navigate to the Webhooks tab and enable Webhooks. Under endpoint, add your intended qube server URL suffixed with '/zoom' (ex. 'https://qube.company.com/zoom').

## Slack setup

4c. Visit https://api.slack.com/apps and click Create an App. Set the App Name to 'qube' and choose your Slack Workplace.
4d. Copy your Client ID and Client Secret and paste into secrets.yml (slack_client_id and slack_client_secret under shared). (You may also want to fill out slack_team_id in secrets.yml while you have slack open - instructions available in secrets.yml).
4e. Under 'Add features and functionality', click on Slash Commands and add a command with the following information:
- Name: '/qube'
- Request URL: your intended qube server URL suffixed with '/slack/command' (https://qube.company.com/slack/command)
- Short Description: 'Update your qube status!'
- Usage Hint: '[help]''
4f. Navigate to 'OAuth & Permissions', and then click on 'Add a new Redirect URL'. Your redirect URL should be your intended qube server URL suffixed with '/users/auth/slack/callback' (https://qube.company.com/users/auth/slack/callback)
4g. Navigate to 'Interactive Components', click 'Enable Interactive Components', and add a Request URL. Your Request URL should be your intended qube server URL suffixed with '/slack' (https://qube.company.com/slack)

4h. Finish update the secrets.yml file with the remaining keys (open_weather_key, num_offices, mailer_sender, secret_key_base, webpush_public_key/webpush_private_key) using the instructions in the comments above each key.

### Build the application locally

This step is optional, but highly recommended.

1. Run `bundle exec rake db:create db:migrate db:seed` to setup your database.
1. Run `rails server` (or `rails s`)
2. View the application (`localhost:3000`).
3. (Optional) Run `rake jobs:work` to send reminders.

## Deploy your office

These instructions are written for an AWS server using a preconfigured image.

### Deploying to a new server for the first time

0. Ensure that you can access the github repository using SSH (NOT HTTPS) - instructions here: https://help.github.com/articles/generating-an-ssh-key/
1. Ensure that you can ssh onto the server that you are trying to deploy to. You must be using ssh keys to deploy using capistrano.
2. The server in question must already have git, ruby, rails, redis, mysql, npm, and yarn installed. Use our suggested AWS image for convenience.
3. New server info  (ssh key locations, IP address, server username, server name) must be added to config/deploy.rb (new ssh key location goes under ssh_options). Staging/test environment information can also be added for development.
4. Run `cap production deploy:setup` to set up directories (unless using the image, which already has initial deploy set up).
5. Run `cap production puma:config` and `cap production puma:nginx_config` to copy over puma (appserver) and nginx (reverse proxy server) config. You'll need to run `sudo service nginx restart` from the server to restart nginx.
6. Add/update a database.yml and secrets.yml file under qube/shared/config (add a secret key base and add database information used to set up MySQL). You will also need to copy over your server certificate to /etc/ssl/certs/ and your server certificate key to /etc/ssl/private/. Your certificates will need to be named qube_production.crt and qube_production.key (or you will need to update the generated nginx config file).
7. Run `cap production deploy`. To access rails console on the server machine, run `cap production rails:console`.

### Deploying to an existing server

Run `cap production deploy`.

Advanced:
- You can rollback a release with `cap [stage] deploy:rollback` if a mistake has been made.
- To access rails console on the server machine, run `cap production rails:console`.

## Authors

* **Nikhila Albert** - *Backend* - [totallyna](https://github.com/totallyna)
* **Birgit Martinelle** - *Frontend* - [bmartinelle](https://github.com/bmartinelle)

## License

This project is licensed under the Q Public License 1.0 - see the [LICENSE.md](LICENSE.md) file for details.
