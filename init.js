const uuid = require('node-uuid');

exports.init = config => {
  // Database connection
  if(process.env.FOOBOT_DB_CONN != undefined) config.db = process.env.FOOBOT_DB_CONN;

  // Address of FOOBOT_DB_CONN
  if(process.env.FOOBOT_URL != undefined) config.url = process.env.FOOBOT_URL;

  // Port to run foobot on
  if(process.env.FOOBOT_PORT != undefined) config.port = process.env.FOOBOT_PORT;

  // Log level
  if(process.env.FOOBOT_LOG_LEVEL != undefined) config.log_level = process.env.FOOBOT_LOG_LEVEL;

  // Route token
  if(config.url != null && config.url != undefined) config.route_token = uuid.v4();

  return config;
}