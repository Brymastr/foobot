const fs = require('fs');

this.logLevel;
this.logDir = process.env.FOOBOT_LOG_DIR || './logs';
this.levels = ['debug', 'info', 'error']; // low to high

exports.debug = message => {
  this.write('debug', message);
}

exports.info = message => {
  this.write('info', message);
}

exports.error = message => {
  this.write('error', message);
}

exports.write = function(level, message) {
  if (this.levels.indexOf(level) < this.levels.indexOf(this.logLevel) ) {
    return;
  }
  if (typeof message !== 'string') {
    message = JSON.stringify(message);
  }

  console.log(message);

}