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
      text: 'foobot tell me I\'m sexy'
    });
    const expectedMessage = 'Hey @Brycen, you are sexy';
    var resultMessage = processing.processMessage(testMessage);

    assert.equal(expectedMessage, resultMessage);
  });
});