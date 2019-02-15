# Deploying Qube

### Prerequisites

qube requires
- [Slack](https://slack.com/). Sign up for the free Slack tier if your company does not currently use Slack.
- [Zoom](https://zoom.us/) accounts. Note that a single Pro Zoom user ($15/mo) is enough to get started with qube; you may want to upgrade to Pro accounts for users if you find that qube is heavily used. Get started with a free Pro trial for three months.
- A SSH-enabled server, domain, and https certificates. An AWS image is available with all dependencies (git, ruby, rails, redis, mysql, and yarn) preinstalled for your convenience; if you host elsewhere you will need to install all dependencies yourself.
- A Linux or OSX machine to download qube locally, configure your company's custom office, and manage deployments.

Does that sound complicated? It's not, we promise! Contact us at <qube@seeq.com> and we'll help you get set up.

## Getting Started

These instructions will get you a copy of qube up and running on your local machine and deployed onto an AWS server. Note that you **must** download and install qube locally and configure server/office options before deploying to a server - only sections 7 and 8 (Choose a Server and Configure a Server) involve your production server!

### Install dependencies (locally)

1. Install Ruby/Rails by following the instructions [here](http://installrails.com/). Skip the steps "Install Rails", "Create your first app", and "See it live!".
2. Download a copy of qube's source code (`git clone https://github.com/seeq12/qube.git`).
3. Install mysql (`brew install mysql`). This step is only required if you intend to run or test the application locally.
4. Install application dependencies by running `bundle install` from the qube directory. This may take awhile.
5. Install yarn (`brew install yarn`) or instructions [here](https://yarnpkg.com/lang/en/docs/install/). This step is only required if you intend to run or test the application locally.
6. Run `yarn install` from the qube directory. This step is only required if you intend to run or test the application locally.

### Secure a domain

1. You'll want a domain for your virtual office. Most likely, you'll want to subdomain an existing domain that your company owns (ex: https://qube.company.com).

### Configure your database

1. Copy config/database.example.yml into a file called config/database.yml. DO NOT distribute this file or add it to a repository.

### Configure your office and add API keys

1. Copy config/secrets.example.yml into a file called config/secrets.yml. This will be the source of your office configuration settings and secret keys. DO NOT distribute this file or add it to a repository.
2. Update the `num_offices` configuration.
3. Generate a secret_key_base by typing in `rails secret` in your terminal (from the qube directory). Your secrets.yml file already contains a secret_key_base for development, test, and production environments. You can leave the development and test environments as is, but the production secret_key_base should be updated. This key is *used to verify the integrity of signed cookies*, so do not skip this step or commit to a repository.
4. Generate a webpush public/private key by opening up the rails console (`rails c`), and typing in `vapid_key = Webpush.generate_key`. Run `vapid_key.public_key` and `vapid_key.private_key` and save the results to webpush_public_key and webpush_private_key, respectively. Use different keys for development/production. (You do not need a development key if you do not want to run or test the application locally). Exit the rails console by typing `quit`.
5. Update the production `action_cable_url` to your intended qube server URL prefixed with 'wss:' and suffixed with '/cable' ('wss://qube.company.com/cable')
6. Optionally, sign up for a free OpenWeatherMap API key at https://openweathermap.org/appid and save as `open_weather_key`. (This key is used for the weather theme - without it, users with the weather theme will see random weather).

#### Configure Zoom for qube and generate Zoom API keys

7. Create a new app on the Zoom Marketplace at https://marketplace.zoom.us/develop/create. You may need to sign up for a Pro Account with at least one user for API access.

    a. On the first page, fill in an App Name (`qube`) and disable "Intend to publish this app on Zoom Marketplace" (your app will be internal to your company). Click "Account-level app" and select "JWT API credentials" in the dropdown that appears. Click "Create".

    b. You will need to fill out some basic information about your app (App Name: `qube`, Short Description `Virtual Office`, Company Name, and Developer Contact Name/Email). If you would like to upload a qube logo, use this [file](https://raw.githubusercontent.com/seeq12/qube/master/app/assets/images/favicons/android-chrome-512x512.png). Click "Continue".

    c. You should see your "App Credentials" now. Copy your API Key and API Secret and paste into secrets.yml (as zoom_api_key and zoom_api_secret, respectively). Click "Continue".

    d. You will want to enable an "Event Subscription" (for all users in the account). The "Event notification endpoint URL" should be set to your intended qube server URL suffixed with '/zoom' (ex. 'https://qube.company.com/zoom'). Add the following four events: (under Meeting) `Start Meeting`, `End Meeting`, `Participant/Host joined meeting`, and `Participant/Host left meeting`. Click "Continue". Your Zoom/qube connection should now be active!

### Configure Slack for qube and generate Slack API keys

8. Visit https://api.slack.com/apps and click Create an App.

    a. Set the App Name to 'qube' and choose your Slack Workplace.

    b. Scroll down to your App Credentials (click on 'Basic Information' first if you don't see this section). Copy your Client ID and Client Secret and paste into secrets.yml (slack_client_id and slack_client_secret under shared).

    c. Under "Add features and functionality", click on Slash Commands and then "Create New Command". Fill in the following for the fields below, and then click Save.
    * Name: '/qube'
    * Request URL: your intended qube server URL suffixed with '/slack/command' (https://qube.company.com/slack/command)
    * Short Description: 'Update your qube status!'
    * Usage Hint: '[help]'
    * Escape channels, users, and links sent to your app: Leave this unchecked.

    d. Scroll down to "Display Information". Fill in the following for the fields below, and then click Save.
    * App icon & Preview: Upload the qube logo available [here](https://raw.githubusercontent.com/seeq12/qube/master/app/assets/images/favicons/android-chrome-512x512.png).
    * Short description: "Virtual Office"
    * color: #232a6e

    e. Navigate to 'OAuth & Permissions' in the side panel, and then click on 'Add a new Redirect URL'. Your redirect URL should be your intended qube server URL suffixed with '/users/auth/slack/callback'

    f. Navigate to 'Interactive Components' in the side panel, enable 'Interactivity', and add a Request URL. Your Request URL should be your intended qube server URL suffixed with '/slack' (https://qube.company.com/slack). Click 'Save Changes'. Your Slack/qube connection should now be active!

    g. Fill out the slack_team_id in secrets.yml. You can find your slack team_id by navigating to your slack messages in a web client (https://company.slack.com/messages). Open Dev Tools (right click anywhere, and click 'Inspect') and click on the 'Elements' tag. Search for "team_id"; it should show up in an object called 'boot_data'. You can also find your team ID using [Slack's API Tester](https://api.slack.com/methods/team.info/test) - generate a token to test with, and click `Test Method`. The ID will appear in the results. If neither of these methods work, try searching for more information on  [stackoverflow](https://stackoverflow.com/questions/40940327/what-is-the-simplest-way-to-find-a-slack-team-id-and-a-channel-id), as slack frequently changes the way that team_id is exposed.

### Choose a server

1. qube is meant to be a lightweight application and will run reasonably well on a general purpose single core, 64-bit Ubuntu server with 4GB RAM/32GB of disk space and moderate network performance for small or medium size companies (~100 users). Larger companies will want to add extra cores (and update the number of puma workers to match the number of cores) and switch to SSD.
2. Ensure that you can ssh onto the server that you are trying to deploy to. You must be using ssh keys to deploy using capistrano. Make sure that SSH (22), HTTP (80), and HTTPS (443) ports are open.

### Configure your server

0. You can use our preconfigured AWS image here: [not currently available]

OR

1. Update packages and install essentials by running the following commands:

    a. `sudo apt-get update`

    b. `sudo apt-get -y upgrade`

    c. `sudo apt-get -y install build-essential patch zlib1g-dev liblzma-dev zlib1g-dev libssl-dev libreadline-gplv2-dev openssh-server libcurl4-openssl-dev libxslt1-dev libxml2-dev memcached git-core nginx libyaml-dev libyaml-0-2 gcc make g++ libgmp-dev mysql-server redis-server libmysqlclient-dev`
2. (Optional) Run `sudo mysql_secure_installation` (to update mysql default security settings). Choose a secure password. You can check that mysql is running by running `mysql -u root` or `sudo mysql -u root` (run `exit` to exit) the mysql client.
3. (Optional) Update the `supervised` setting in `/etc/redis/redis.conf` to `systemd` to manage redis as a service and restart (`sudo systemctl restart redis.service`). You can check that redis is running using the CLI `redis-cli` (run `ping` to test and `exit` to exit).
4. Install node/npm by running `curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -`, followed by `sudo apt install nodejs`.
4. Install RVM by following the instructions [here](https://rvm.io/rvm/install). It is recommended not to use the version provided by apt-get.
5. Install ruby by running `rvm install 2.4.0` (qube is currently locked at 2.4.0). This may take some time.
6. Install yarn by running `sudo npm install -g yarn`.
7. Install nokogiri by running `gem install nokogiri`. This may take some time.

### Configure your deployment

1. Ensure that you have a local ssh public/private key pair (~/.ssh/id_rsa exists). Generate one (`ssh-keygen -t rsa`) and add it to your agent (`ssh-add`) if this is not the case.
2. Ensure that you can access github using SSH (NOT HTTPS) - instructions here: https://help.github.com/articles/generating-an-ssh-key/. You must be able to connect using SSH for deployments.
3. Copy config/deploy.example.rb into a file called deploy.rb.

    a. Update :deploy_to if your server user is not `ubuntu` or the file structure is different (for example, if you are deploying on Azure).

    b. Update :ssh_options by adding a location to keys if your id_rsa key is elsewhere. Add your server SSH key here as well.
4. Copy config/deploy/production.example.rb into a file called config/deploy/production.rb. Fill out this file with your server IP address (`ip`), server user (`user`), and servername (`nginx_server_name`).
5. Copy your local files `database.yml` and `secrets.yml` to your server as `qube/shared/config/database.yml` and `qube/shared/config/secrets.yml` from the home directory. (If you're not exactly where these files should go, you can run `cap production deploy` and let it fail on these missing files; capistrano will create any missing directories and print out a full path for you).

    a. Delete the `development` and `test` sections in these files (as we do not want to accidentally run in development or test mode on the server).

    b. Update the mysql username, password, and socket in `database.yml`.
6. Create the production database on your server by running the command `create database qube_production` in the mysql client (`mysql -u root`).
7. Run `cap production puma:config` and `cap production puma:nginx_config` to copy over puma (appserver) and nginx (reverse proxy server) config.

    a. Remove the default nginx configuration (`sudo rm default`) in `/etc/nginx/sites-enabled`.

    b. Copy over your server certificate to /etc/ssl/certs/ and your server certificate key to /etc/ssl/private/. Your certificates will need to be named qube_production.crt and qube_production.key (or you will need to update `/etc/nginx/sites-enabled/qube_production`).

    OR if you don't have certificates, use Let's Encrypt to generate certificates:
    * Run `sudo add-apt-repository ppa:certbot/certbot`
    * Run `sudo apt-get update`
    * Run `sudo apt-get install python-certbot-nginx`
    * Delete or comment out SSL related config in `/etc/nginx/sites-enabled/qube_production` so nginx config is valid for certificate generation (shown below).
    * Run `sudo certbot --nginx -d qube.company.com`. Note that your domain must already be pointing to your server.

    c. You'll need to run `sudo service nginx restart` from the server to restart nginx.

```
#  ssl on;
#  ssl_certificate /etc/ssl/certs/qube_production.crt;
#  ssl_certificate_key /etc/ssl/private/qube_production.key;
```

8. Run `cap production deploy`.
9. Copy over your server certificate to /etc/ssl/certs/ and your server certificate key to /etc/ssl/private/. Your certificates will need to be named qube_production.crt and qube_production.key (or you will need to update the generated nginx config file).

### Deploying to an existing server

Run `cap production deploy`.

Advanced:
- You can rollback a release with `cap [stage] deploy:rollback` if a mistake has been made.
- To access rails console on the server machine, run `cap production rails:console`.

### Run qube locally (for development or testing)

This step is optional.

1. Start mysql (`mysql.server start`).
2. Run `bundle exec rake db:create db:migrate db:seed` to setup your database. Note that by default, we will generate a busy office for you (You cannot interact with generated users, though).
1. Run `rails server` (or `rails s`)
2. View the application (`localhost:3000`).
3. (Optional) Run `rake jobs:work` to send reminders.
