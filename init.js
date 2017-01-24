const uuid = require('node-uuid');

exports.init = config => {
  const vars = process.env;

  // General
  if(vars.FOOBOT_DB_CONN) config.db = vars.FOOBOT_DB_CONN;
  if(vars.FOOBOT_PORT) config.port = vars.FOOBOT_PORT;
  if(vars.FOOBOT_LOG_LEVEL) config.log_level = vars.FOOBOT_LOG_LEVEL;
  if(vars.FOOBOT_URL) config.url = vars.FOOBOT_URL;

  // Telegram
  if(vars.FOOBOT_TELEGRAM_TOKEN) config.telegram.token = vars.FOOBOT_TELEGRAM_TOKEN;
  config.route_token = uuid.v4();

  // Messenger
  if(vars.FOOBOT_MESSENGER_WEBHOOK_TOKEN) config.messenger.webhook_token = vars.FOOBOT_MESSENGER_WEBHOOK_TOKEN;
  if(vars.FOOBOT_MESSENGER_PAGE_ACCESS_TOKEN) config.messenger.page_access_token = vars.FOOBOT_MESSENGER_PAGE_ACCESS_TOKEN;

  // Facebook
  if(vars.FOOBOT_FACEBOOK_APP_ID) config.facebook.app_id = vars.FOOBOT_FACEBOOK_APP_ID;
  if(vars.FOOBOT_FACEBOOK_APP_SECRET) config.facebook.app_secret = vars.FOOBOT_FACEBOOK_APP_SECRET;

  // Canada Post
  if(vars.FOOBOT_CANADA_POST_AUTH) config.canada_post.auth = vars.FOOBOT_CANADA_POST_AUTH; 

  // Google APIs
  if(vars.FOOBOT_GOOGLE_FLIGHTS_KEY) config.google.flights_key = vars.FOOBOT_GOOGLE_FLIGHTS_KEY;

  // Condo entry (Mark Niehe)
  if(vars.FOOBOT_CONDO_ENTRY_URL) config.condo.url = vars.FOOBOT_CONDO_ENTRY_URL;

  return config;
}