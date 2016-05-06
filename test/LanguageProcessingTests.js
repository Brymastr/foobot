var assert = require('chai').assert;
var processing = require('../processing');
var Message = require('../message');

describe('Language processor', function() {
  it('should call Danny a vietnamese guy', function () {
    const testMessage = new Message({
      text: 'foobot call Danny a fancy vietnamese guy'
    });
    const expectedMessage = 'Hey @Danny, you are a fancy vietnamese guy';
    var resultMessage = processing.processMessage(testMessage);

    assert.equal(expectedMessage, resultMessage);
  });

  it('should tell me I\'m sexy', function () {
    const testMessage = new Message({
      user: 'Brycen',
      text: "foobot could you please tell my good friend Danny that I'm going to the island this weekend"
    });
    const expectedMessage = "Hey @Danny, I'm going to the island this weekend";
    var resultMessage = processing.processMessage(testMessage);

    assert.equal(expectedMessage, resultMessage);
  });
});

var a = 'foobot/NN could/MD you/PRP tell/VB Danny/NNP I/NN \'/" m/NN going/VBG to/TO the/DT island/NN this/DT weekend/NN';