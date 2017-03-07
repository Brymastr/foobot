const
  processing = require('./processing'),
  config = require('./init')(require('./config.json')),
  queueName = process.argv[2],
  routeKey = process.argv[3];

// Create the queue before subscribing
const queuePromise = connection => new Promise(resolve => {
  return connection.createChannel().then(channel => {
    return channel.assertQueue(queueName)
      .then(queue => channel.bindQueue(queue.queue, 'foobot', routeKey))
      .then(() => channel.close());
  })
  .then(resolve)
  .catch(console.warn);
});

// Initialize everything needed for this process
require('./startup').then(app => {
  return queuePromise(app.queueConnection).then(() => {
    return app.queueConnection.createChannel();
  })
  .then(channel => {
    channel.consume(queueName, message => {
      if(!message.consumerTag) channel.ack(message);
      message = JSON.parse(message.content.toString());
      processing.processUpdate(message, app.queueConnection, app.classifier);
    });
  });
});