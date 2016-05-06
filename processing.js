var exports = module.exports = {};

exports.isTrigger = function(text) {
  if(text.match(/(foobot)/)) {
    return true;
  } else {
    return false;
  }
}

exports.processMessage = function(message) {
  var text = message.text;
  switch(true) {
    case (/(call|tell) .+/).test(text):
      var what = text.split(/(call|tell) .+/)[1];
      var target = what.split(' ')[0];
      if(target == 'me') {
        target = message.user;
      }
      var message = 'Hey @' + target + ', you are ' + what;
      console.log('first case');
      break;
      
    default:
      message = 'default';
      console.log('default');
  }
  
  return message;
}  