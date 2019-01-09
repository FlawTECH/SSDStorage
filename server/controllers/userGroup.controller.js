const Joi = require('joi');
const UserGroup = require('../models/userGroup.model');

const UserGroupSchema = Joi.object({
  groupId: Joi.string().required(),
  userId: Joi.string().required()
})

module.exports = {
  insert
}

async function insert(userGroup) {
  userGroup = await Joi.validate(userGroup, UserGroupSchema, { abortEarly: false });
  return await new UserGroup(userGroup).save();
}