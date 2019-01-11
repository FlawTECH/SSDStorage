const mongoose = require('mongoose');

const UserGroupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
});


module.exports = mongoose.model('UserGroup', UserGroupSchema);
