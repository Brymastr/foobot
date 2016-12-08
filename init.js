const 
  uuid = require('node-uuid'),
  ngrok = require('ngrok');

exports.init = config => {

  // General
  if(process.env.FOOBOT_DB_CONN != undefined) config.db = process.env.FOOBOT_DB_CONN;
  if(process.env.FOOBOT_PORT != undefined) config.port = process.env.FOOBOT_PORT;
  if(process.env.FOOBOT_LOG_LEVEL != undefined) config.log_level = process.env.FOOBOT_LOG_LEVEL;
  if(process.env.FOOBOT_URL != undefined) config.url = process.env.FOOBOT_URL;

  // Telegram
  if(process.env.FOOBOT_TOKEN != undefined) config.telegram.token = process.env.FOOBOT_TOKEN;
  config.route_token = uuid.v4();

  // Messenger
  if(process.env.FOOBOT_MESSENGER_WEBHOOK_TOKEN != undefined) config.messenger.webhook_token = process.env.FOOBOT_MESSENGER_WEBHOOK_TOKEN;
  if(process.env.FOOBOT_PAGE_ACCESS_TOKEN != undefined) config.messenger.page_access_token = process.env.FOOBOT_PAGE_ACCESS_TOKEN;

  // Facebook
  if(process.env.FOOBOT_FACEBOOK_APP_ID != undefined) config.facebook.app_id = process.env.FOOBOT_FACEBOOK_APP_ID;
  if(process.env.FOOBOT_FACEBOOK_APP_SECRET) config.facebook.app_secret = process.env.FOOBOT_FACEBOOK_APP_SECRET;

  // Canada Post
  if(process.env.FOOBOT_CANADA_POST_AUTH != undefined) config.canada_post.auth = process.env.FOOBOT_CANADA_POST_AUTH;

  return config;
}