// Require libraries
const 
  mongoose = require('mongoose'),
  express = require('express'),
  http = require('http'),
  bodyParser = require('body-parser'),
  processing = require('./processing'),
  telegramBot = require('./services/telegram'),
  methodOverride = require('method-override'),
  log = require('./logger'),
  natural = require('natural'),
  ngrok = require('ngrok');
  init = require('./init');

var config = require('./config.json');

// Express setup
var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json({type:'application/json'}));
app.use(methodOverride());

// Configurations
ngrok.connect((err, url) => {
  config.url = url;
  config = init.init(config);

log.logLevel = config.log_level;
log.debug(`Route token: ${config.route_token}`);

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Logging middleware
app.use('*', (req, res, next) => {
  log.info(`${req.method}: ${req.baseUrl}`);
  // log.debug(req.body);
  next();
});

// Routes + classifier
natural.BayesClassifier.load('classifier.json', null, (err, classifier) => {  
  let routes = require('./routes')(config.route_token, classifier);
  app.use('/', routes);
});

// MongoDB connection
mongoose.connect(config.db);
mongoose.connection.on('open', () => {
  console.log(`Mongo connection is open. Connected to: ${config.db}`);
});

// Start server
http.createServer(app).listen(config.port, () => {
  log.info(`server listening on port ${config.port}`);
});

// maybe put everything inside callback from ngrok

// Telegram
if(config.telegram != undefined) {
  telegramBot.setWebhook(config);
}

// Skype

// Slack

// Messenger

});
