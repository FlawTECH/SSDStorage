const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  stateId: {
    type: String,
    required: true,
    default: "0"
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('User', UserSchema);
