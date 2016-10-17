var fs = require('fs');

this.logLevel;
this.logDir = process.env.FOOBOT_LOG_DIR || './logs';
this.levels = ['debug', 'info', 'error']; // low to high

exports.debug = function(message) {
  this.write('debug', message);
}

exports.info = function(message) {
  this.write('info', message);
}

exports.error = function(message) {
  this.write('error', message);
}

exports.write = function(level, message) {
  if (this.levels.indexOf(level) < this.levels.indexOf(this.logLevel) ) {
    return;
  }
  if (typeof message !== 'string') {
    message = JSON.stringify(message);
  }
  // Ensure directory exists
  // fs.access(this.logDir, fs.W_OK, (err) => {
  //   if(err) fs.mkdirSync(this.logDir)
  //   message = err ? 'error writing to log dir: ' + err : `${new Date().toISOString()} ${level} : ${message}`;
    console.log(message);
    // if(!err) fs.appendFile(this.logDir + '/log.txt', message + '\r\n');
  // });
}