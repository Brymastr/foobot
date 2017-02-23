const 
  config = require('../config.json'),
  rabbit = require('amqplib');

/* Route key guidlines: "a.b.c"
{
  a: [
    'incoming',
    'internal',
    'outgoing'
  ],
  b: [
    'message'
  ],
  c: [
    'telegram',
    'messenger',
    'twitter',
    'nlp'
  ]
}

*/

// Publish to RabbitMQ with a given topic
exports.pub = (connection, routingKey, message) => {
  return new Promise((resolve, reject) => {
    connection.createChannel()
      .then(channel => {
        channel.publish(config.rabbit.exchange_name, routingKey, new Buffer(JSON.stringify(message)));
        channel.close();
        resolve();
      });
  });
};