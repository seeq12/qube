const { environment } = require('@rails/webpacker');

environment.loaders.append('json', {
  test: /\.json$/,
  use: 'json-loader'
});

module.exports = environment;
