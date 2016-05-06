var pos = require('pos');
var chunker = require('pos-chunker');

var exports = module.exports = {};

exports.isTrigger = function(text) {
  return !!text.match(/(foobot)/);
};

exports.processMessage = function(message) {
  var text = message.text;
  var result;
  switch(true) {
    case (/(call|tell) .+/).test(text):
      var verb = text.match(/.* (call|tell)/)[1];
      text = removeText(text, /.* (call|tell) /);
      var who = text.match(/[a-zA-Z0-9]+/)[0];
      text = removeText(text, /[a-zA-Z0-9]+ /);
      var what = text;


      if(who == 'me') {
        who = message.user;
      }
      if(verb == 'tell') {
        // what = removeText(what, /([a-zA-Z0-9]+ ){2}/)
      }
      result = 'Hey @' + who + ', you are ' + what;
      console.log('first case');
      break;
      
    default:
      result = 'default';
      console.log('default');
  }
  
  return result;
};

function removeText(text, regex) {
  return text.replace(text.match(regex)[0], '');
}