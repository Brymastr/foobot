// Require libraries
const 
  promisify = require('es6-promisify'),
  express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  log = require('./logger'),
  ngrokConnect = promisify(require('ngrok').connect),
  config = require('./init')(require('./config.json')),
  passport = require('passport'),
  compression = require('compression'),
  fork = require('child_process').fork;

require('./passport')(passport);
log.logLevel = config.log_level;
log.debug(`Route token: ${config.route_token}`);

// Express setup
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({type: 'application/json'}));
app.use(methodOverride());
app.use(passport.initialize());
app.use(compression());

// Logging middleware
app.use('*', (req, res, next) => {
  log.debug(`${req.method}: ${req.baseUrl}`);
  next();
});

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const ngrok = () => new Promise(resolve => {
  if(!config.url) {
    ngrokConnect(config.port).then(url => {
      config.url = url;
      resolve(url);
    });
  } else resolve();
});
// Startup
app.listen(config.port);

ngrok()
  .then(() => require('./startup'))
  .then(startup => {
    // Use routes
    app.use('/', require('./routes')(passport, startup.queueConnection));

    // Subscribe to queues
    let queues = new Map();
    queues.set('internal', 'internal.message.nlp');

    queues.forEach((value, key) => {
      log.debug(`Subscriber starting for ${key} queue`);
      fork(__dirname + '/subscribe', [key, value], {silent: false, stdio: 'pipe'});
    });
    console.log('startup complete');
  });