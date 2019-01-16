const Joi = require('joi');
const Group = require('../models/group.model');
const jwtDecode = require("jwt-decode");
const shortid = require('shortid');


const GroupSchema = Joi.object({
  name: Joi.string().required(),
  fileId: Joi.any().required(),
  userId: Joi.any().required(),
  status: Joi.boolean().required()
})

module.exports = {
  insert,
  generateGroup
}

function generateGroup(req,res,callback) {  
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  var userid = decoded._id;
  req = req.body;
  var newGroup =  new Group({
  "fileId" : req.fileId,
  "name" : shortid.generate(),
  "userId" :  userid,
  "status" : false
}).save(); 
newGroup.then(function(result) {
  callback(res, result);
})

}


async function insert(group) {
  group = await Joi.validate(group, GroupSchema, { abortEarly: false });
  return await new Group(group).save();
}