const Joi = require('joi');
const FileGroup = require('../models/fileGroup.model');

const FileGroupSchema = Joi.object({
  groupId: Joi.string().required(),
  fileId: Joi.string().required()
})

module.exports = {
  insert
}

async function insert(fileGroup) {
  fileGroup = await Joi.validate(fileGroup, FileGroupSchema, { abortEarly: false });
  return await new FileGroup(fileGroup).save();
}