const
  assert = require("chai").assert,
  Message = require('../models/Message'),
  telegram = require('../services/telegram'),
  strings = require('../strings');

describe('Telegram connector', () => {

  it('returns a message object given a telegram update', (done) => {
    const update = {
      "update_id":10000,
      "message":{
        "date":1441645532,
        "chat":{
          "last_name":"Test Lastname",
          "id":1111111,
          "first_name":"Test first name",
          "username":"Test"
        },
        "message_id":1365,
        "from":{
          "last_name":"Test Lastname",
          "id":2222222,
          "first_name":"Test",
          "username":"Test"
        },
        "text":"hey foobot"
      }
    }

    const expected = new Message({
      message_id: 1365,
      date: 1441645532,
      user: {
        "last_name":"Test Lastname",
        "id":2222222,
        "first_name":"Test",
        "username":"Test"
      },
      chat_id: 1111111,
      chat_name: "Test first name",
      text: "hey foobot"
    });

    let actual = telegram.conform(update);

    console.dir(expected.user)
    console.dir(actual.user)

    assert.equal(actual.message_id, expected.message_id);
    assert.equal((new Date(actual.date)).toUTCString(), (new Date(expected.date)).toUTCString());
    assert.deepEqual(actual.user, expected.user);
    assert.equal(actual.chat_id, expected.chat_id);
    assert.equal(actual.chat_name, expected.chat_name);
    done();
  });


});