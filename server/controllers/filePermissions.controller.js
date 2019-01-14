const Joi = require('joi');
const FilePermissions = require('../models/filePermissions.model');
const jwtDecode = require("jwt-decode");
const WrongFilePermissionsError = require('../errors').WrongPermissionsError


const FilePermissionsSchema = Joi.object({
  fileId: Joi.any().required(),
  userId: Joi.any().required(),
  read: Joi.boolean().required(),
  write: Joi.boolean().required(),
  delete: Joi.boolean().required(),
  isOwner: Joi.any()
})

module.exports = {
  insert,
  changePermissions
}

async function insert(filePermissions) {
  filePermissions = await Joi.validate(filePermissions, FilePermissionsSchema, { abortEarly: false });
  return await new FilePermissions(filePermissions).save();
}

function changePermissions(newFilePermissions, callback) {
  var decoded = jwtDecode(newFilePermissions.headers.authorization.split(' ')[1]);
  userid = decoded._id;
  newFilePermissions = newFilePermissions.body;
  User.findById(userid, (err, userMakingReq) => {
    if (err || !userMakingReq) {
      return callback (err, userMakingReq)
    }
    FilePermissions.findById(newFilePermissions._id, (fileErr, fileDoc) => { 
      if (fileErr || !fileDoc) {
        return callback (fileErr, fileDoc)
      }
      if(userMakingReq.roles.indexOf('admin') == 0 || (fileDoc.userId == userid && fileDoc.isOwner == true)) {
        FilePermissions.update({_id: fileDoc._id}, newFilePermissions, {upsert: false}, (err, doc) => {
          callback(err, doc)
        });
      }else{
        return callback(new WrongFilePermissionsError ('Error: Only admin or file owner can change permissions of this file'), null)
      }
    })
  })
}