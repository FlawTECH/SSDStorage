const Joi = require('joi');
const FilePermissions = require('../models/filePermissions.model');
const jwtDecode = require("jwt-decode");
const User = require('../models/user.model')
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
  console.log("newFilePermissions.body: " +newFilePermissions.body);
  var decoded = jwtDecode(newFilePermissions.headers.authorization.split(' ')[1]);
  userid = decoded._id;
  console.log("userid: " +userid);
  newFilePermissions = newFilePermissions.body;
  User.findById(userid, (err, userMakingReq) => {
    if (err || !userMakingReq) {
      return callback (err, userMakingReq)
    }
  console.log("userMakingReq: " +userMakingReq.roles.indexOf('admin'));
  console.log("newFilePermissions.id: " +newFilePermissions._id);

    FilePermissions.findById(newFilePermissions._id, (fileErr, fileDoc) => { 
      
      console.log("fileDoc: " +fileDoc.userId);

      if (fileErr || !fileDoc) {
        return callback (fileErr, fileDoc)
      }
      // if(userMakingReq.roles.indexOf('admin') != 0 || fileDoc.userId != userid) {
      //   return callback(new WrongFilePermissionsError ('Error: Only admin or file owner can change permissions of this file'), null)
      // }
      FilePermissions.update({_id: fileDoc._id}, newFilePermissions, {upsert: false}, (err, doc) => {
        callback(err, doc)
      });
    })
    
  })
}