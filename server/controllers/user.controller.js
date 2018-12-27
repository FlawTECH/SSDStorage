const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/user.model');
const WrongStatusError = require('../errors').WrongStatusError

const userSchema = Joi.object({
  fullname: Joi.string().required(),
  status: Joi.string().required().regex(/^Waiting$|^Active$|^Deleted$|^Deactivated$/),
  password: Joi.string().required(),
  repeatPassword: Joi.string().required().valid(Joi.ref('password')),
  roles: Joi.array().required(),
})

module.exports = {
  insert,
  setStatus
}

async function insert(user) {
  if (user.roles.indexOf('admin') > -1 && user.status !== "Active")
    throw new WrongStatusError ('An admin must be active when registering')
  if (user.roles.indexOf('admin') < 0 && user.status !== "Waiting")
    throw new WrongStatusError ('A user must be waiting when registering')

  user = await Joi.validate(user, userSchema, { abortEarly: false });
  user.hashedPassword = bcrypt.hashSync(user.password, 10);
  delete user.password;
  return await new User(user).save();
}

function setStatus(id, newStatus, callback) {
  User.findByIdAndUpdate(id, {"status": newStatus}, (err, doc) => {
    callback(err, doc)
  })
}