const mongoose = require('mongoose');

const UserStatesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});


module.exports = mongoose.model('File', UserStatesSchema);
