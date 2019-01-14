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
const fs = require('fs-extra');
const jszip = require('jszip');

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
  let unzipFiles = false;
  
  var form = new formidable.IncomingForm();
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  form.parse(req);

  form.on('file', function(name, file) {
    incomingFiles.push(file);
  });

  form.on('field', function(name, value) {
    if(name === "path") { filePath = value; }
    if(name === "isfolder" && value === "true") { unzipFiles = true; }
  });

  form.on('end', function() {
    //All files and fields have been processed
    //TODO throw error on empty filepath

    //Checking authorization
    userId = new mongoose.Types.ObjectId(decoded._id);

    let subfolderCount = incomingFiles.length>0?1:2
    let subDirPath = filePath.split('/', filePath.split('/').length-subfolderCount).join('/');
    let subDirName = filePath.split('/').slice(filePath.split('/').length-subfolderCount,filePath.split('/').length-subfolderCount+1).join('');

    console.log(subDirPath);
    console.log(subDirName);

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
      { "$match": { "$and": [
        { "userId": userId },
        { "file.name": subDirName },
        { "file.path": "/"+subDirPath },
        { "file.type": "d" },
        { "write": true }
      ]}}
    ]).count("authorizedCount").exec(function(err, dbRes) {
      if(dbRes.length>0) {

        //File can be written here
        fs.ensureDirSync(__dirname+"/../userDirectory/"+filePath)

        //Unzip if dir upload
        if(unzipFiles) {
          fs.readFile(incomingFiles[0].path, function(err, data) {
            if(err) throw err;
            jszip.loadAsync(data).then(
              (zip) => {
                console.log(zip.files);
              }
            );
          });
        }
        else if(incomingFiles.length == 0) { //Create directory

          let dirPath = filePath.split('/', filePath.split('/').length-1).join('/');
          let dirName = filePath.split('/').slice(filePath.split('/').length-1,filePath.split('/').length).join('');

          let folder = {
            'name': dirName,
            'path': "/"+dirPath,
            'type': 'd'
          }

          var folderId;
          fileCtrl.insert(folder).then(
            insertedFolder => {
              folder = insertedFolder;
              Filedb.findOne({
                name: folder.name
              }, (err, dbRes) => {
                folderId = dbRes._id;
                folder = folder.toObject();
      
                permissionToCreate = {
                  'fileId': folderId,
                  'userId': userId,
                  'read': true,
                  'write': true,
                  'delete': true,
                  'isOwner': true,
                };
                persmissionCtrl.insert(permissionToCreate).then(
                  permissionToCreate => {
                    let craftedResponse = insertedFolder.toObject();
                    res.json(craftedResponse);
                  }
                );
              });
            }
          );
        }
        else { // Upload files
          for(let i=0; i<incomingFiles.length; i++) {
            fs.moveSync(incomingFiles[i].path, __dirname+"/../userDirectory/"+filePath+"/"+incomingFiles[i].name, function(err) {
              if(err) throw(err);
            })

            //Adding perm to DB
            let fileToUpload = {
              'name': incomingFiles[i].name,
              'path': (subDirPath.length>0?"/":"")+subDirPath+"/"+subDirName,
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
                      let craftedResponse = insertedFile.toObject();
                      res.json(craftedResponse);
                    }
                  );
                });
              }
            );
          }
        }
      }
      else {
        //TODO throw error
        res.status(401).end(); return;
      }
    });
  })
}

async function getFileListByUserId(req, res) {  
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  let userid = decoded._id;
  
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
      { "userId": new mongoose.Types.ObjectId(userid) },
      { "file.path": req.query.path },
      { "read": true }
    ]}}
  ],
  function(err, resp) {
    res.send(resp);
 });
}
