const Joi = require('joi');
const UserState = require('../models/userState.model');

const UserStateSchema = Joi.object({
  name: Joi.string().required()
})

module.exports = {
  insert
}

async function insert(userState) {
  userState = await Joi.validate(userState, UserStateSchema, { abortEarly: false });
  return await new UserState(userState).save();
}