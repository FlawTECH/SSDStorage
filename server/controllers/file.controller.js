const Joi = require('joi');
const File = require('../models/file.model');

const FileSchema = Joi.object({
  name: Joi.string().required(),
  path: Joi.string().required()
})

module.exports = {
  insert
}

async function insert(file) {
  file = await Joi.validate(file, FileSchema, { abortEarly: false });
  return await new File(file).save();
}