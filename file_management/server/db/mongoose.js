const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
var uri = process.env.MONGODB_URI;
var opts = { useNewUrlParser: true };
mongoose.connect(uri, opts);

module.exports = {mongoose};