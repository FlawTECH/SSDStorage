const mongoose = require('mongoose');

const UserGroupSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Group',
    required: true
  },
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true
  }
});


module.exports = mongoose.model('UserGroup', UserGroupSchema);
