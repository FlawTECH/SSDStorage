const mongoose = require('mongoose');

const UserStateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('UserState', UserStateSchema);
