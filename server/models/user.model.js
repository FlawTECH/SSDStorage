const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    required: true,
    match: [/^Waiting$|^Active$|^Deleted$|^Deactivated$/]
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
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'UserState',
    required: true
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
