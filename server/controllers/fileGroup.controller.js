const Joi = require('joi');
const FileGroup = require('../models/fileGroup.model');

const FileGroupSchema = Joi.object({
  fileId: Joi.any().required(),
  groupId: Joi.any().required()
})

module.exports = {
  insert,
  treshold
}

async function insert(fileGroup) {
  fileGroup = await Joi.validate(fileGroup, FileGroupSchema, { abortEarly: false });
  return await new FileGroup(fileGroup).save();
}

function treshold(req, res){

  
}