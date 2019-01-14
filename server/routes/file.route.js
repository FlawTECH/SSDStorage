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
router.route('/delete')
  .put(asyncHandler(deleteFile));

router.get('/download/:fileName', function(req, res){
    var file = __dirname + '/../userDirectory/'+req.params.fileName;
    res.download(file);
  });


function deleteFile(req,res) {
  let deleteFile = fileCtrl.deleteFile(req);
  res.json(deleteFile);

}


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
        { "file.path": filePath.split('/')[0] },
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
        else {
          for(let i=0; i<incomingFiles.length; i++) {
            fs.moveSync(incomingFiles[i].path, __dirname+"/../userDirectory/"+filePath+"/"+incomingFiles[i].name, function(err) {
              if(err) throw(err);
            })

            //Adding perm to DB
            let fileToUpload = {
              'name': incomingFiles[i].name,
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
                    }
                  );
                });
              }
            );
          }
        }
        res.json("Upload successful");
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
      { "file.path": req.query.path }
    ]}}
  ],
  function(err, resp) {
    res.send(resp);
 });
}


