// Require libraries
const 
  promisify = require('es6-promisify'),
  express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  log = require('./logger'),
  ngrok = promisify(require('ngrok').connect),
  config = require('./config.json'),
  passport = require('passport'),
  rabbit = require('amqplib'),
  fork = require('child_process').fork;

// Express setup
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({type: 'application/json'}));
app.use(methodOverride());
app.use(passport.initialize());

// Logging middleware
app.use('*', (req, res, next) => {
  log.info(`${req.method}: ${req.baseUrl}`);
  next();
});

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// This is the main entrypoint for the app
require('./startup').then(startup => {
  
  // Set up the basics
  log.logLevel = config.log_level;
  log.debug(`Route token: ${config.route_token}`);

  // Use routes
  require('./passport')(passport);
  app.use('/', require('./routes')(passport, startup.queueConnection));

  // Start the express app
  app.listen(config.port);

  // Start ngrok if no URL environment variable set
  if(!process.env.FOOBOT_URL)
    ngrok(config.port).then(url => config.url = url);

  // Subscribe to queues
  let queues = new Map();
  queues.set('internal', 'internal.message.nlp');

  queues.forEach((value, key) => {
    console.log(`Subscriber starting for ${value} queue`);
    fork(__dirname + '/subscribe', [key, value], {silent: false, stdio: 'pipe'});
  });
});