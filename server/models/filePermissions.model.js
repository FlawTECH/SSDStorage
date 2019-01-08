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
    type: boolean,
    required: true
  },
  write: {
    type: boolean,
    required: true
  },
  delete: {
    type: boolean,
    required: true
  }
});


module.exports = mongoose.model('File', FilePermissionsSchema);
