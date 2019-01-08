const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    match: ['/([a-zA-Z0-9\s_\\.\-\(\):])+$/', 'File name invalid.']
  },
  path: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  ownerId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  }, 
  groupId: {
    type: String,
  }
});


module.exports = mongoose.model('File', FileSchema);
