const Joi = require('joi');
const FilePermissions = require('../models/filePermissions.model');

const FilePermissionsSchema = Joi.object({
  fileId: Joi.any().required(),
  userId: Joi.any().required(),
  read: Joi.boolean().required(),
  write: Joi.boolean().required(),
  delete: Joi.boolean().required(),
  isOwner: Joi.any()
})

module.exports = {
  insert
}

async function insert(filePermissions) {
  filePermissions = await Joi.validate(filePermissions, FilePermissionsSchema, { abortEarly: false });
  return await new FilePermissions(filePermissions).save();
}