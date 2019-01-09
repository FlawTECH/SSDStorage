const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/user.model');
const UserState = require('../models/userState.model');

const userSchema = Joi.object({
  fullname: Joi.string().required(),
  password: Joi.string().required(),
  repeatPassword: Joi.string().required().valid(Joi.ref('password'))
})

module.exports = {
  insert
}

async function insert(user) {
  user = await Joi.validate(user, userSchema, { abortEarly: false });
  user.hashedPassword = bcrypt.hashSync(user.password, 10);
  delete user.password;
  await UserState.findOne({name: 'DISABLED'}, async function(err, res) {
    user.stateId = res._id;
    // dbUser.stateId.push(res);
  });
  return await new User(user).save();
}