const Joi = require('joi');
const File = require('../models/file.model');
const fileUpload = require('express-fileupload');

const FileSchema = Joi.object({
  // name: Joi.string().required(),
 // path: Joi.string().required()
})

module.exports = {
  insert
}

async function insert(req) {
  
  

 

  file = await Joi.validate(req, FileSchema, { abortEarly: false });
  
  return await new File(file).save();
}