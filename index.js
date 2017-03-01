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

require('./init')(config);
require('./passport')(passport);
log.logLevel = config.log_level;
log.debug(`Route token: ${config.route_token}`);

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

// Startup
app.listen(config.port);
if(!process.env.FOOBOT_URL)
  ngrok(config.port).then(url => config.url = url);

// Everything that needs a database, message queue, or classifier
require('./startup').then(startup => {
  
  // Use routes
  app.use('/', require('./routes')(passport, startup.queueConnection));

  // Subscribe to queues
  let queues = new Map();
  queues.set('internal', 'internal.message.nlp');

  queues.forEach((value, key) => {
    console.log(`Subscriber starting for ${key} queue`);
    fork(__dirname + '/subscribe', [key, value], {silent: false, stdio: 'pipe'});
  });
});