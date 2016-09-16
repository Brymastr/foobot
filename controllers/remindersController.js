/*
Control access to the db Reminders
Improvements:
  - Delete after activation
  - Error handling
*/  

const log = require('../logger');
const Reminder = require('../models/Reminder');

exports.createReminder = (reminder, cb) => {
  message.save(_reminder => cb(_message));
};

// Get n reminders for a given user
exports.getReminders = (userId, cb) => {
  Reminder.find({user_id: userId}, (err, reminders) => cb(reminders));
};

// DEV: Get all reminders
exports.getAllReminders = cb => {
  Reminder.find({}, (err, reminders) => cb(reminders));
};

exports.deleteReminders = cb => {
  Reminder.remove({}, () => cb('Reminders deleted'));
};