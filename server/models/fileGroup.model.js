const mongoose = require('mongoose');

const FileGroupSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Group',
    required: true
  },
  fileId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'File',
    required: true
  }
});


module.exports = mongoose.model('FileGroup', FileGroupSchema);
