const express = require('express');
const passport = require('passport');
const passportjwt = require('passport-jwt');
const asyncHandler = require('express-async-handler');
const fileCtrl = require('../controllers/file.controller');
const persmissionCtrl = require('../controllers/filePermissions.controller');
const formidable = require('formidable');
const jwtDecode = require("jwt-decode");
const router = express.Router();
const User = require("../models/user.model");
const Filedb = require("../models/file.model");
const filePermissions = require("../models/filePermissions.model");
const mongoose = require('mongoose');
const fs = require('fs-extra');
const jszip = require('jszip');
const he = require('he');


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
router.route('/move')
  .put(asyncHandler(moveFile));
router.route('/generate')
  .post(asyncHandler(generateGroup));
/* router.route('/download')
  .post(asyncHandler(download)); */

router.get('/download', function(req, res){
  console.log(req.query.path)
  var file = __dirname + '/../userDirectory'+req.query.path;
  res.download(file);
});

async function download(req,res) {
  var file = __dirname + '/../userDirectory/'+req.body.path;
  res.download(file);
}

async function generateGroup(req,res) {
  await fileCtrl.generateGroup(req, res, FileCallback); 
}

function moveFile(req,res) {
  let moveFile = fileCtrl.moveFile(req);
  res.json(moveFile);
}

async function renameFile(req,res) {
  req.body.name = he.encode(req.body.name.replace('/',''));
  await fileCtrl.renameFile(req, res, FileCallback); 
}

async function deleteFile(req,res) {
  await fileCtrl.deleteFile(req, res, FileCallback);  
}

function FileCallback(res, info) {
  res.json(info);
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
        let promises = [];
        let workDone;

        //File can be written here
        let uploadedDir = unzipFiles?incomingFiles[0].name.split('.').splice(0,incomingFiles[0].name.split('.').length-1).join('.'):"";
        baseDir = __dirname+"/../userDirectory/"+filePath+(unzipFiles?"/"+uploadedDir:"")

        // Subfolder based on zip file name
        if(unzipFiles) {
          promises.push(new Promise(function(resolve, reject) {createDirectory(
            filePath,
            filePath.split('/').length,
            baseDir.split('/').splice(baseDir.split('/').length-1, 1).join('/'),
            __dirname+"/../userDirectory/"+filePath,
            userId,
            unzipFiles,
            resolve,
            reject
          );}));
        }

        //Unzip if dir upload
        if(unzipFiles) {
          workDone = new Promise(function(resolveParent, rejectParent){
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
                        var destPath = filePath+"/"+uploadedDir+"/"+zippedFileName.split('/').splice(0,zippedFileName.split('/').length-1).join('/');
                        if(destPath.endsWith('/')) { destPath = destPath.substr(0, destPath.length-1); }
                        zippedFileName = zippedFileName.split('/')[zippedFileName.split('/').length-1];

                        //Creating dir
                        promises.push(new Promise(function(resolve,reject) { createDirectory(destPath, filePath.split('/').length, zippedFileName, baseDir, userId, unzipFiles, resolve, reject); }));
                        if(i == Object.keys(contents.files).length-1) {
                          resolveParent(0);
                        }
                      }
                      else {
                        zip.file(zippedFileName).async('nodebuffer').then( // Is a file
                          (unzippedFileContents) => {

                            promises.push(new Promise(function(resolve, reject) { createFileFromZip(unzippedFileContents, zippedFileName, baseDir, subDirPath, subDirName+"/"+uploadedDir, userId, resolve, reject);}));
                            if(i == Object.keys(contents.files).length-1) {
                              resolveParent(0);
                            }
                          }
                        )
                      }
                    }
                  )
                }
              );
            });
          });
        }
        else if(incomingFiles.length == 0) { //Create directory
          workDone = new Promise(function(resolveParent, rejectParent){
            let dirPath = filePath.split('/', filePath.split('/').length-1).join('/');
            let dirName = filePath.split('/').slice(filePath.split('/').length-1,filePath.split('/').length).join('');

            promises.push(new Promise(function(resolve, reject) { createDirectory(dirPath, 0, dirName, baseDir, userId, unzipFiles, resolve, reject);}));
            resolveParent(0);
          });
        }
        else { // Upload files & directories
          workDone = new Promise(function(resolveParent, rejectParent){
            for(let i=0; i<incomingFiles.length; i++) {
              console.log(incomingFiles[i]);
              // promises.push(new Promise(function(resolve, reject) { createFile(incomingFiles[i], filePath, subDirPath, subDirName, userId, resolve, reject);}));
            }
            resolveParent(0);
          });
        }

        // Waits for all promises to be done
        Promise.all([workDone]).then(function(y, n) {
          let message = "Success"
          Promise.all(promises.map(p => p.catch(() => { undefined; message = "Error"}))).then(function(result, rejected) {
            var finalResponse = Object.assign({
              'files': result,
              'message': message
            });
            res.json(finalResponse);
          });
        });
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
      { "file.path": req.query.path },
      { "read": true }
    ]}}
  ],
  function(err, resp) {
    res.send(resp);
  });
}

async function createDirectory(dirPath, filePathDepth, dirName, baseDir, userId, unzipFiles, resolve, reject) {
  
  let folder = {
    'name': dirName,
    'path': "/"+dirPath,
    'type': 'd'
  }

  // Creating dir on file system
  if(unzipFiles) {
    dirPath = dirPath.split('/').splice(filePathDepth+1, dirPath.split('/').length-2).join('/');
  }

    
  try {
    if(fs.existsSync(baseDir+(unzipFiles?(dirPath.length>0?"/"+dirPath:"")+"/"+dirName:""))) { reject("Directory already exists"); return;}
    fs.ensureDirSync(baseDir+(unzipFiles?(dirPath.length>0?"/"+dirPath:"")+"/"+dirName:""));
  }
  catch (err) {
    reject(err);
    return;
  }

  var folderId;

  try {
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
                resolve(craftedResponse);
            }
          );
        });
      }
    );
  }
  catch(err) {
    reject(err);
  }
}

async function createFile(file, filePath, subdirPath, subdirName, userId, resolve, reject) {

  try {
    fs.moveSync(file.path, __dirname+"/../userDirectory/"+filePath+"/"+file.name);
  }
  catch(err) {
    reject(err);
    return;
  }

  //Adding perm to DB
  let fileToUpload = {
    'name': file.name,
    'path': (subdirPath.length>0?"/":"")+subdirPath+"/"+subdirName,
    'type': 'f'
  };

  var fileId;

  try {
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
              resolve(craftedResponse);
            }
          );
        });
      }
    );
  }
  catch(err) {
    reject(err);
  }
}

async function createFileFromZip(file, fileName, filePath, subdirPath, subdirName, userId, resolve, reject) {

  try {
    if(fs.existsSync(filePath+"/"+fileName)) { reject("File already exists"); return; }
    fs.writeFileSync(filePath+"/"+fileName, file);
  }
  catch(err) {
    reject(err);
    return;
  }

  var subdirFileName = fileName.split('/').splice(fileName.split('/').length-1,1).join('/');
  var subdirFilePath = fileName.split('/').splice(0,fileName.split('/').length-1).join('/');
  
  //Adding perm to DB
  let fileToUpload = {
    'name': subdirFileName,
    'path': ((subdirPath.length>0?"/":"")+subdirPath+"/"+subdirName+(subdirFilePath.length>0?"/"+subdirFilePath:"")),
    'type': 'f'
  };

  var fileId;

  try {
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
              resolve(craftedResponse);
            }
          );
        });
      }
    );
  }
  catch(err) {
    reject(err);
  }
}