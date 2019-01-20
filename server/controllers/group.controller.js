const Joi = require('joi');
const Group = require('../models/group.model');
const jwtDecode = require("jwt-decode");
const shortid = require('shortid');
const serverInstance = require("../index");


const GroupSchema = Joi.object({
  name: Joi.string().required(),
  fileId: Joi.any().required(),
  userId: Joi.any().required(),
  status: Joi.boolean().required(),
  statusGlobal: Joi.boolean().required()
})

module.exports = {
  insert,
  generateGroup,
  joinGroup,
  checkStatusDownloadFile,
  changeStatusGroupFile,
  displayFileGroup
}

// POST localhost:4040/api/displayFileGroup  
function displayFileGroup(req,res, callback) {
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  var userid = decoded._id;
  let message = "Success"  
  Group.find({userId:userid}).exec(function(err, fileGroup){
    try {
      if (Object.keys(fileGroup).length !== 0) {
        var finalResponse = Object.assign({
          'fileGroup': fileGroup,
          'message': message
        });
        callback(res, finalResponse);
      }
    } catch (error) {
      var finalResponse = Object.assign({
        'message': message
      });
      finalResponse.message="Error";
      callback(res,finalResponse);
    }   
  });

}

// POST localhost:4040/api/changeStatusGroupFile with fileId and name of the group
function changeStatusGroupFile(req,res, callback) {
  serverInstance.getio().emit("message",req.body);
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  var userid = decoded._id;
  var finalResponse = Object.assign({
    'message': "Success"
  });
  Group.findOneAndUpdate({fileId:req.body.fileId, name:req.body.name, userId:userid}, {$set:{status: true}},  function(err,status) {
    try {
      if(Object.keys(status).length !== 0){       
        callback(res, finalResponse);
      }
    } catch (error) {
      finalResponse.message="Error";
      callback(res,finalResponse);
    }   
  });
}


// POST localhost:4040/api/checkStatusDownloadFile with fileId and name of the group
function checkStatusDownloadFile(req,res,callback) {
  var finalResponse = Object.assign({
    'message': "Success"
  });
  var newvalues = { $set: {statusGlobal: true } };
  Group.find({fileId:req.body.fileId, name:req.body.name}).countDocuments().exec(function(err, nbUser){
    if(nbUser != 0){
    nbUserNeeded = Math.round(nbUser/2);
    Group.find({fileId:req.body.fileId, name:req.body.name,status: true}).countDocuments().exec(function(err, nbStatusTrue){
      if(nbStatusTrue >= nbUserNeeded){
        console.log("presque"+req.body.fileId+req.body.name)
        Group.find({fileId:req.body.fileId, name:req.body.name}).update(newvalues).exec(function(err, statusGlob){
        console.log("CA FONCTIONNE"+statusGlob)
        callback(res, finalResponse);
        });
      }else{
        finalResponse.message="Error";
        callback(res,finalResponse);
    }});
  }else{
    finalResponse.message="Error";
        callback(res,finalResponse);
  }
  });
}


// GET localhost:4040/api/group/tmgLnCJg5  |  tmgLnCJg5 is the group name
function joinGroup(req,res,callback) { //need the req.params.groupName that is the name of the group
  // Add user to the group if he go to this url 
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  var userid = decoded._id;
  var finalResponse = Object.assign({
    'message': "Success"
  });
  Group.findOne({name:req.params.groupName}).exec(function(err, group){
    try {
      if(Object.keys(group).length !== 0){
        var newGroup =  new Group({
          "fileId" : group.fileId,
          "name" : req.params.groupName,
          "userId" :  userid,
          "status" : false
        }).save(); 
        newGroup.then(function(result) {
          callback(res, finalResponse);
        })
        }
    } catch (error) {
      finalResponse.message="Error";
      callback(res,finalResponse);
    }
    
  });
  
}
// POST localhost:4040/api/group/generate/ with fileId
function generateGroup(req,res,callback) {  //Generate a group name. Create new entry in collection group with the name and other attributs. the name must be used as url: api/group/"nameGenerated"
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  var userid = decoded._id;
  req = req.body;

  const newGroup =  new Group({
    "fileId" : req.fileId,
    "name" : shortid.generate(),
    "userId" :  userid,
    "status" : false,
    "statusGlobal" : false
  }).save(); 

  newGroup.then(function(result) {
    callback(res, result);
  })
}


async function insert(group) {
  group = await Joi.validate(group, GroupSchema, { abortEarly: false });
  return await new Group(group).save();
}