const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
});


module.exports = mongoose.model('File', GroupSchema);
