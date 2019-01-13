const express = require('express');
const passport = require('passport');
const passportjwt = require('passport-jwt');
const asyncHandler = require('express-async-handler');
const fileCtrl = require('../controllers/file.controller');
const persmissionCtrl = require('../controllers/filePermissions.controller');
var formidable = require('formidable');
const jwtDecode = require("jwt-decode");
const router = express.Router();
const User = require("../models/user.model");
const Filedb = require("../models/file.model");
const filePermissions = require("../models/filePermissions.model");
const mongoose = require('mongoose');
const fs = require('fs');

module.exports = router;

router.use(passport.authenticate('jwt', {
  session: false
}))


router.route('/')
  .post(asyncHandler(insert));
router.route('/')
  .get(asyncHandler(getFileListByUserId));

router.get('/download/:fileName', function(req, res){
    var file = __dirname + '/../userDirectory/'+req.params.fileName;
    res.download(file);
  });

async function insert(req, res) {
  
  let FilePermissionsModel = mongoose.model('FilePermissions');
  let FileModel = mongoose.model('File');
  let userId;
  let filePath;
  let incomingFiles = [];
  
  var form = new formidable.IncomingForm();
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  form.parse(req);

  form.on('file', function(name, file) {
    incomingFiles.push(file);
  });

  form.on('field', function(name, value) {
    if(name === "path") { filePath = value; }
  });

  form.on('end', function() {
    //All files and fields have been processed
    //TODO throw error on empty filepath
    //Checking authorization
    userId = new mongoose.Types.ObjectId(decoded._id);
    
    //Checking if user has perm to write there
    FilePermissionsModel.aggregate([
      {
        "$lookup": {
          "from": FileModel.collection.name,
          "localField": "fileId",
          "foreignField": "_id",
          "as": "file"
        }
      },
      // { "$unwind": "$file" },
      { "$match": { "$and": [
        { "userId": userId },
        { "file.path": filePath },
        { "file.type": "d" },
        { "write": true }
      ]}}
    ]).count("authorizedCount").exec(function(err, dbRes) {
      console.log("I'm waiting "+dbRes.length);
      if(dbRes.length>0) {
        //File can be written here
        fs.rename(incomingFiles[0].path, __dirname+"/../userDirectory/"+filePath+"/"+incomingFiles[0].name, function(err) {
          if(err) throw(err);
        })
        //Adding perm to DB

        let fileToUpload = {
          'name': incomingFiles[0].name,
          'path': filePath,
          'type': 'f'
        };
    
        var fileId;
    
        fileCtrl.insert(fileToUpload).then(
          insertedFile => {
            fileToUpload = insertedFile;
            Filedb.findOne({
              name: fileToUpload.name
            }, (err, dbRes) => {
              fileId = dbRes._id;
              fileToUpload = fileToUpload.toObject();
    
              permissionToCreate = {
                'fileId': fileId,
                'userId': userId,
                'read': true,
                'write': true,
                'delete': true,
                'isOwner': true,
              };
              persmissionCtrl.insert(permissionToCreate).then(
                permissionToCreate => {
                  let craftedResponse = {
                    'file': incomingFiles[0],
                    'perm': permissionToCreate
                  }
                  res.json(craftedResponse);
                }
              );
            });
          }
        );
      }
      else {
        //TODO throw error
      }
    });
  })

  // form.on('field', async function(name, value) {
  //   console.log('received non file');

  //   if(name === "path") { filePath = value; }
  //   if(filePath == undefined) { invalidPath = true; return; }
    
    
  // });
  
  // if(invalidPath) { res.status(500).end(); return; }

  // form.on('fileBegin', function (name, file) {
  //   console.log("parsing");
  //   file.path = __dirname + '/../userDirectory/'+decoded.fullname+'/'+file.name;
  // });
  
  // form.on('file', async function (name, file) {
  //   console.log("received file")

  // });
}

async function getFileListByUserId(req, res) {
  console.log(req.query.path);
  
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  let userid;
  await User.findOne({fullname:decoded.fullname},(err,res)=> userid = res._id);
  // await filePermissions.findOne({ userId: userid},(err,res)=> fileid = res.fileId);
  
  let FileModel = mongoose.model('File');
  let FilePermissionsModel = mongoose.model('FilePermissions');

  FilePermissionsModel.aggregate([
    {
      "$lookup": {
        "from": FileModel.collection.name,
        "localField": "fileId",
        "foreignField": "_id",
        "as": "file"
      }
    },
    { "$unwind": "$file" },
    { "$match": { "$and": [
      { "userId": userid },
      { "file.path": req.query.path }
    ]}}
  ],
  function(err, resp) {
    res.send(resp);
 });
}
