const 
  config = require('../config.json'),
  rabbit = require('amqplib');

var connection = rabbit.connect('amqp://localhost');

// Publish to RabbitMQ with a given topic
exports.pub = (topic, message) => {
  return new Promise((resolve, reject) => {
    connection
      .then(conn => conn.createChannel())
      .then(channel => {
        return channel.assertQueue(topic).then(ok => {
          console.log(`Message queued: ${message.text}`)
          return channel.sendToQueue(topic, new Buffer(message.text));
        });
      })
      .then(() => resolve(message));
  })
  .catch(reject);
}

// Subscribe messages with a given topic from RabbitMQ
exports.sub = topic => {
  return new Promise((resolve, reject) => {
    connection
      .then(conn => conn.createChannel())
      .then(channel => {
        return channel.assertQueue(topic).then(fok => {
          return channel.consume(topic, msg => {
            console.log(`Message dequeued: ${msg.content.toString()}`);
            channel.ack(msg);
          });
        })
        .then(resolve);
      })
      .catch(reject);
  });   
};