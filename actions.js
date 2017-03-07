/**
 * These functions are all the actions that foobot can perform. The processing module
 * decides what to do, and then forwards the messages to the appropriate action in this module.
 */

const 
  services = require('./services'),
  natural = require('natural'),
  urban = require('urban'),
  log = require('./logger'),
  strings = require('./strings'),
  fs = require('fs'),
  textParser = require('./textParser'),
  usersController = require('./controllers/usersController'),
  compromise = require('nlp_compromise'),
  config = require('./config.json');


this.kanye = 'I miss the old kanye'; // The most iconic of foobot features
this.kanyeDoc = fs.readFile('./kanye.txt', 'utf-8', (err, data) => {
  this.kanye = data;
});

exports.linkCondo = message => new Promise(resolve => {
  console.log(message, user)
  usersController.getUser(message.user_id).then(user => {
    console.log(message, user)
    
    message.response = 'Open the doors to this plane';
    message.reply_markup = {
      keyboard: [[{
        text: 'Link my condo account',
        type: 'request_contact'
      }]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
    
    user.action = 'phone_number';
    user.save().then(resolve);
  });
});

exports.openCondo = (message, phone_number, cb) => {
  natural.PorterStemmer.attach();
  let stemmed = message.text.tokenizeAndStem().join(' ');
  
  let number = compromise.value(stemmed).number || 0;
  let duration = number * 1000; // start off with seconds then find appropriate multiplier

  // get unit
  let units = textParser.parseStringForTokens(stemmed, ['second', 'minut', 'hour', 'dai', 'week', 'month', 'year', 'half', 'bit', 'while']);
  // calculate door unlock duration in miliseconds  
  if(units.includes('second')) {
    // do nothing it's already in seconds
  } else if(units.includes('minut')) {
    duration *= 60;
  } else if(units.includes('half') && units.includes('hour')) {
    if(message.text.includes('hour and')) {number = 1; duration = 1000;}
    number === 0 ? duration = 1800000 : duration *= 5400;
  } else if(units.includes('hour')) {
    if(message.text.includes(' an ')) number = 1;
    duration *= 3600;
  } else if(units.includes('dai')) {
    duration *= 86400;
  } else if(units.includes('week') || units.includes('month') || units.includes('year')) {
    message.response = strings.$('tooLong');
  } else if(units.includes('bit') || units.includes('while')) {
    duration = 1000;
    duration *= 900;
  } else {
    // No parameters. "open the door"
    duration = 600000;
  }

  if(duration > 86400000 && duration <= 432000000) message.response = 'I can do one day, I suppose';
  else if(duration > 432000000) message.response = strings.$('tooLong');

  if(message.response) {
    cb(message);
  } else if(!phone_number) {
    this.linkCondo(message, result => cb(result));
  } else {
    services.condo.open(duration, phone_number, null, null, result => {
      message.response = result;
      cb(message);
    });
  }
};

exports.closeCondo = (message, phone_number, cb) => {
  services.condo.close(phone_number, null, result => {
    message.response = result;
    cb(message);
  });
};

// Google QPX Flights api
exports.flights = (message, cb) => {
  services.google.getFlights(message, result => {
    message.response = result;
    cb(message);
  });
};

// I miss the old Kanye
exports.iMissTheOldKanye = () => {
  let kanye = this.kanye.split(/[,\n]+/).map(line => line.replace('\\', ''));
  return kanye[Math.floor(Math.random() * (kanye.length - 1))]
};

// Lookup a definition from urban dictionary
exports.uDic = (message, word, cb) => {
  urban(word).first(data => {
    if(!data) data = {definition: 'The library I used for Urban Dictionary lookups is having a down day, probably'}
    if(message.source == 'telegram') message.response = `*Definition:* ${data.definition}\n*Example:* ${data.example}`;
    else if(message.source == 'messenger') message.response = `Here's what Urban Dictionary has to say\n: ${data.definition}`;
    else message.response = `Here's what Urban Dictionary has to say\n: ${data.definition}`;
    cb(message);
  });
};

// Package tracking
exports.trackPackage = (messageText, cb) => {
  let trackingNumber = messageText.match(/(\d|[A-Z]){10,16}/g);
  services.canadaPost.trackPackage(trackingNumber).then(info => cb(info));
};

// Facebook login
exports.facebookLogin = message => {
  message.response = strings.$('facebookLoginRequest');
  message.keyboard = [[{
    type: 'account_link',
    text: 'Login to Facebook',
    url: `${config.url}/auth/facebook/${message.source}/${message.user_id}/${message.chat_id}`,
    data: null
  }]];
  return message;  
  // if(message.source == 'telegram') {
  //   message.reply_markup = {
  //     inline_keyboard: [[{
  //       text: 'Login to Facebook',
  //       url: `${config.url}/auth/facebook/telegram/${message.user_id}/${message.chat_id}`
  //     }]]
  //   }
  // } else if(message.source == 'messenger') {
  //   message.response = null;
  //   message.reply_markup = {
  //     type: 'template',
  //     payload: {
  //       template_type: 'button',
  //       text: 'Yep, this is how it works.',
  //       buttons: [{
  //         type: 'account_link',
  //         url: `${config.url}/auth/facebook/messenger/${message.user_id}/${message.chat_id}`
  //       }]
  //     }
  //   }
  // }
};

// Foobot is self aware
exports.iAmFoobot = () => {
  return strings.$('meta');
};

// URL shortening (by me)
exports.shortenUrl = (message, done) => {
  let url = message.text.match(/(http|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/i);
  if(!url) done('');
  else {
    services.ziip.shorten(url[0])
      .then(short => done(`${config.ziip.url}/${short}`))
      .catch(err => done());
  }
};