/*
Control access to the db Reminders
Improvements:
  - Delete after activation
  - Error handling
*/  

const log = require('../logger');
const Reminder = require('../models/Reminder');
const Message = require('../models/Message');
const schedule = require('node-schedule');
const bot = require('../telegramBotApi');

exports.createReminder = (reminder, cb) => {
  // Reminder may already exist if it has been scheduled on before, could be scheduled multiple times
  Reminder.findOne({_id: reminder._id}, (err, result) => {
    if(!result)  // Reminder doesn't already exist
      reminder.save((err, _reminder) => cb(_reminder));
    else         // Reminder already exists so just return it
      cb(reminder);
  });
};

// Get n reminders for a given user
exports.getReminders = (userId, cb) => {
  Reminder.find({user_id: userId}, (err, reminders) => cb(reminders));
};

// DEV: Get all reminders
exports.getAllReminders = cb => {
  Reminder.find({}, (err, reminders) => cb(reminders));
};

// DEV: Delete all reminders
exports.deleteReminders = cb => {
  Reminder.remove({}, () => cb('Reminders deleted'));
};

exports.deleteById = (reminderId, cb) => {
  Reminder.remove({_id: reminderId}, (err, result) => cb(result));
};

exports.scheduleReminder = (reminder, cb) => {
  // Save reminder to database with recurrence scheme
  this.createReminder(reminder, (_reminder) => {
    // Re evaluate, maybe reschedule
    schedule.scheduleJob(_reminder.date, () => {
      // What to do every execution (Send message)
      bot.sendMessage(new Message({
        response: _reminder.text,
        chat_id: _reminder.chat_id // TODO: send to user directly instead of the chat it originated from
      }));

      if(_reminder.scheme != 'once') {
        // _reminder.date += 
        schedule.scheduleJob(_reminder.date, () => {
          bot.sendMessage(new Message({
            response: _reminder.text,
            chat_id: _reminder.chat_id // TODO: send to user directly instead of the chat it originated from
          }));
          cb();
        });     
      }
    });
  });
};