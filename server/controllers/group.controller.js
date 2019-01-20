const Joi = require('joi');
const Group = require('../models/group.model');
const jwtDecode = require("jwt-decode");
const shortid = require('shortid');
const serverInstance = require("../index");
const mongoose = require('mongoose');
const decrypt = require('../cryptoUtil').decrypt;


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

// GET localhost:4040/api/group/displayFileGroup   
function displayFileGroup(req,res, callback) {
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  var userid = decoded._id;
  let message = "Success" ;
  let FileModel = mongoose.model('File');
  let GroupModel = mongoose.model('Group');

  GroupModel.aggregate([{
    $lookup: {
        from: FileModel.collection.name, // collection name in db
        localField: "fileId",
        foreignField: "_id",
        as: "info"
    }
},
{ "$unwind": "$info" },
{ "$match": { "$and": [
  { "userId": new mongoose.Types.ObjectId(userid) }
]}}
], function(err, data) {
  try {
    if(Object.keys(data).length !== 0){
      for(var z = 0; z<data.length; z++) {
        data[z].info.name = decrypt(data[z].info.name);
      }
      var finalResponse = Object.assign({
        'fileGroup': data,
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
        Group.find({userId:userid, name: req.params.groupName}).countDocuments().exec(function(err, nbUser){
          if(nbUser == 0){
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
        else{
        console.log("Error: " +userid +" is already in group " +req.params.groupName)
        finalResponse.message="Error: Already in the group";
        callback(res,finalResponse);
        }
        });
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