const mongoose = require('mongoose');

const FileGroupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true
  },
  fileId: {
    type: String,
    required: true
  }
});


module.exports = mongoose.model('FileGroup', FileGroupSchema);
