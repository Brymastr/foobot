/**
 * This is not a member in the common sense. It is a memory tied to a user that can be later recalled by asking foobot for it (or just an api call)
 */

const 
  mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports = mongoose.model('Member', Schema({
  
}));