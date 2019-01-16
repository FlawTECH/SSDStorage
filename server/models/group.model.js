const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  fileId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'File',
    required: true
  },
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Group', GroupSchema);
