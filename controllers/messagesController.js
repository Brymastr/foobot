/*
Control access to the db Message collection
Improvements:
  - Paging
  - Error handling
*/  

const log = require('../logger');
const Message = require('../models/Message');

exports.createMessage = (message, cb) => {
  message.save(_message => cb(_message));
}

// Get messages for a conversation
exports.getMessagesForConversation = (chatId, cb) => {
  Message.find({chat_id: chatId}, (err, messages) => cb(messages));
};

// Get messages for a specific user from all conversations
exports.getMessagesForUser = (userId, cb) => {
  Message.find({chat_id: chatId, 'user.id': userId}, (err, messages) => cb(messages));
};

// Get messages for a specific user from a specific conversation
exports.getMessagesForUserByConversation = (userId, chatId, cb) => {
  Message.find({chat_id: chatId, 'user.id': userId}, (err, messages) => cb(messages));
};

// DEV: Get all messages
exports.getAllMessages = (cb) => {
  Message.find({}, (err, messages) => cb(messages));
};

// DEV: Delete all messages
exports.deleteMessages = (cb) => {
  Message.remove({}, () => cb('Messages deleted'));
};