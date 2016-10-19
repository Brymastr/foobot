const 
  uuid = require('node-uuid'),
  ngrok = require('ngrok');

exports.init = config => {

  // Database connection
  if(process.env.FOOBOT_DB_CONN != undefined) config.db = process.env.FOOBOT_DB_CONN;

  // Port to run foobot on
  if(process.env.FOOBOT_PORT != undefined) config.port = process.env.FOOBOT_PORT;

  // Log level
  if(process.env.FOOBOT_LOG_LEVEL != undefined) config.log_level = process.env.FOOBOT_LOG_LEVEL;

  // Address of foobot himself
  if(process.env.FOOBOT_URL != undefined) config.url = process.env.FOOBOT_URL;

  // Route token
  config.route_token = uuid.v4();

  return config;
}