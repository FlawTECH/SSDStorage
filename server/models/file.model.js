const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
   // required: true,
    //match: ['/([a-zA-Z0-9\s_\\.\-\(\):])+$/', 'File name invalid.']
  },
  path: {
    type: String,
    //required: true
  },
  type: {
    type: String,
   // required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
   // required: true
  }
});

module.exports = mongoose.model('File', FileSchema);
