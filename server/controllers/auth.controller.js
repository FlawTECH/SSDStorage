const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user.model')

module.exports = {
  generateToken,
  getOTP
}

function generateToken(user) {
  const payload = JSON.stringify(user);
  return jwt.sign(payload, config.jwtSecret);
}

async function getOTP(fullname) {
  const user = await User.findOne({fullname: fullname});
  return user.toObject().secret;
}