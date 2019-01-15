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
router.route('/rename')
  .put(asyncHandler(renameFile));

router.get('/download/:fileName', function(req, res){
    var file = __dirname + '/../userDirectory/'+req.params.fileName;
    res.download(file);
  });

function renameFile(req,res) {
  let renameFile = fileCtrl.renameFile(req);
  res.json(renameFile);
}

function deleteFile(req,res) {
  let deleteFile = fileCtrl.deleteFile(req);
  res.json(deleteFile);
}

async function insert(req, res) {
  
  let FilePermissionsModel = mongoose.model('FilePermissions');
  let FileModel = mongoose.model('File');
  let userId;
  let filePath;
  let baseDir;
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
    ]).count("authorizedCount").exec(async function(err, dbRes) {
      if(dbRes.length>0 || decoded.roles.includes("admin")) {
        let allFilesCreated = [];

        //File can be written here
        baseDir = __dirname+"/../userDirectory/"+filePath+(unzipFiles?"/"+incomingFiles[0].name.split('.').splice(0,incomingFiles[0].name.split('.').length-1).join('.'):"")

        // Subfolder based on zip file name
        if(unzipFiles) {
          allFilesCreated.push(createDirectory(
            filePath,
            baseDir.split('/').splice(baseDir.split('/').length-1, 1).join('/'),
            __dirname+"/../userDirectory/"+filePath,
            userId,
            unzipFiles
          ));
        }

        //Unzip if dir upload
        if(unzipFiles) {
          fs.readFile(incomingFiles[0].path, function(err, data) {
            if(err) throw err;
            let zip = new jszip();
            zip.loadAsync(data).then(
              (contents) => {
                Object.keys(contents.files).forEach(
                  function(zippedFileName, i) {
                    if(zippedFileName.endsWith('/')) { // Is a directory
                      //Fixing filename for creating dirs
                      zippedFileName = zippedFileName.substr(0,zippedFileName.length-1);
                      var destPath = filePath+"/"+zippedFileName.split('/').splice(0,zippedFileName.split('/').length-1).join('/');
                      if(destPath.endsWith('/')) { destPath = destPath.substr(0, destPath.length-1); }
                      zippedFileName = zippedFileName.split('/')[zippedFileName.split('/').length-1];
                      allFilesCreated.push(createDirectory(destPath, zippedFileName, baseDir, userId, unzipFiles));
                    }
                    else {
                      zip.file(zippedFileName).async('nodebuffer').then( // Is a file
                        (unzippedFileContents) => {
                          allFilesCreated.push(createFileFromZip(unzippedFileContents, zippedFileName, baseDir, subDirPath, subDirName, userId));
                        }
                      )
                    }
                  }
                )
              }
            );
          });
        }
        else if(incomingFiles.length == 0) { //Create directory
          let dirPath = filePath.split('/', filePath.split('/').length-1).join('/');
          let dirName = filePath.split('/').slice(filePath.split('/').length-1,filePath.split('/').length).join('');

          allFilesCreated.push(createDirectory(dirPath, dirName, filePath, userId));
        }
        else { // Upload files
          for(let i=0; i<incomingFiles.length; i++) {
            allFilesCreated.push(await createFile(incomingFiles[i], filePath, subDirPath, subDirName, userId));
          }
        }
        console.log(allFilesCreated);
        res.json(allFilesCreated);
      }
      else {
        //TODO throw error
        res.status(401).send("You are not allowed to do this here"); return;
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
      decoded.roles.includes('admin')?{}:{ "userId": new mongoose.Types.ObjectId(userid) },
      { "file.path": "/"+req.query.path },
      { "read": true }
    ]}}
  ],
  function(err, resp) {
    res.send(resp);
  });
}

function createDirectory(dirPath, dirName, baseDir, userId, unzipFiles) {
  let folder = {
    'name': dirName,
    'path': "/"+dirPath,
    'type': 'd'
  }

  // Creating dir on file system
  if(unzipFiles) {
    dirPath = dirPath.split('/').splice(1, dirPath.split('/').length-1).join('/');
  }
  fs.ensureDirSync(baseDir+(unzipFiles?(dirPath.length>0?"/"+dirPath:"")+"/"+dirName:""));

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
              let craftedResponse = {
                'file': insertedFolder,
                'perm': permissionToCreate
              }
              return craftedResponse;
          }
        );
      });
    }
  );
}

function createFile(file, filePath, subdirPath, subdirName, userId) {
  fs.moveSync(file.path, __dirname+"/../userDirectory/"+filePath+"/"+file.name, function(err) {
    if(err) throw(err);
  })

  //Adding perm to DB
  let fileToUpload = {
    'name': file.name,
    'path': (subdirPath.length>0?"/":"")+subdirPath+"/"+subdirName,
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
              'file': insertedFile,
              'perm': permissionToCreate
            }
            console.log(craftedResponse);
            return craftedResponse;
          }
        );
      });
    }
  );
}

function createFileFromZip(file, fileName, filePath, subdirPath, subdirName, userId) {
  fs.writeFileSync(filePath+"/"+fileName, file);

  var subdirFileName = fileName.split('/').splice(fileName.split('/').length-1,1).join('/');
  var subdirFilePath = fileName.split('/').splice(0,fileName.split('/').length-1).join('/');
  
  //Adding perm to DB
  let fileToUpload = {
    'name': subdirFileName,
    'path': (subdirPath.length>0?"/":"")+subdirPath+"/"+subdirName+(subdirFilePath.length>0?"/"+subdirFilePath:""),
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
              'file': insertedFile,
              'perm': permissionToCreate
            }
            return craftedResponse;
          }
        );
      });
    }
  ); 
}