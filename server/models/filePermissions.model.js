const mongoose = require('mongoose');

const FilePermissionsSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    required: true
  },
  write: {
    type: Boolean,
    required: true
  },
  delete: {
    type: Boolean,
    required: true
  },
  isOwner: {
    type: Boolean,
    required: true
  }
});


module.exports = mongoose.model('FilePermissions', FilePermissionsSchema);
