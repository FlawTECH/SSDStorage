const Joi = require('joi');
const Group = require('../models/group.model');

const GroupSchema = Joi.object({
  name: Joi.string().required(),
  fileId: Joi.any().required(),
  userId: Joi.any().required()
})

module.exports = {
  insert
}

async function insert(group) {
  group = await Joi.validate(group, GroupSchema, { abortEarly: false });
  return await new Group(group).save();
}