const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const fileCtrl = require('../controllers/file.controller');
const persmissionCtrl = require('../controllers/filePermissions.controller');
const formidable = require('formidable');
const jwtDecode = require("jwt-decode");
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs-extra');
const jszip = require('jszip');
const he = require('he');
const encryptor = require('file-encryptor');
const encrypt = require('../cryptoUtil').encrypt;
const decrypt = require('../cryptoUtil').decrypt;

module.exports = router;

const encryptionSecret = '<3Nas-2018';

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
router.route('/download')
  .post(asyncHandler(download));
router.route('/downloaddir')
  .post(asyncHandler(downloadFolder))

/* router.route('/download')
  .post(asyncHandler(download)); */

router.get('/download', function(req, res){
  console.log(req.query.path);
  var file = __dirname + '/../userDirectory' + req.query.path;
  const fileName = req.query.path.split('/')[req.query.path.split('/').length - 1];
  const path = req.query.path.replace(fileName, '');
  // const encryptedFileName = __dirname + '/../userDirectory' + path + encrypt(fileName)
  fs.renameSync(file, file + '.dat')
  encryptor.decryptFile(file + '.dat', file, encryptionSecret, function(err){
    res.download(file, err => {
      fs.removeSync(file)
      fs.renameSync(file + '.dat', file)
    });
  })
});

async function download(req,res) {
  var file = __dirname + '/../userDirectory/'+req.body.path;
  res.download(file + '.txt');
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

async function downloadFolder(req, res) {
  fileCtrl.downloadDir(req).then((response => {
    res.download(response);
  })).catch((error) => {
    let response = { 'message': error }
    res.send(response);
  });
  // res.download(zippedFolder)
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
    if(name === "path") { filePath = value; if(filePath.startsWith('/')) { filePath = filePath.substr(1, filePath.length-1) } }
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
      if (dbRes.length>0 || decoded.roles.includes("admin")) {
        let promises = [];
        let workDone;

        //File can be written here
        let uploadedDir = unzipFiles?incomingFiles[0].name.split('.').splice(0,incomingFiles[0].name.split('.').length-1).join('.'):"";
        baseDir = __dirname+"/../userDirectory/"+filePath+(unzipFiles?"/"+uploadedDir:"")

        // Subfolder based on zip file name
        if (unzipFiles) {
          promises.push(new Promise(function(resolve, reject) {createDirectory(
            filePath,
            filePath.split('/').length,
            baseDir.split('/').splice(baseDir.split('/').length - 1, 1).join('/'),
            __dirname+"/../userDirectory/"+filePath,
            userId,
            unzipFiles,
            resolve,
            reject
          );}));
        }

        //Unzip if dir upload
        if (unzipFiles) {
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
                        promises.push(new Promise(function(resolve,reject) { createDirectory(destPath, filePath.split('/').length, zippedFileName, baseDir, userId, unzipFiles, false, resolve, reject); }));
                        if (i == Object.keys(contents.files).length - 1) {
                          resolveParent(0);
                        }
                      } else {
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
        } else if(incomingFiles.length == 0) { //Create directory
          workDone = new Promise(function(resolveParent, rejectParent){
            let dirPath = filePath.split('/', filePath.split('/').length-1).join('/');
            let dirName = filePath.split('/').slice(filePath.split('/').length-1,filePath.split('/').length).join('');

            promises.push(new Promise(function(resolve, reject) { createDirectory(dirPath, 0, dirName, baseDir, userId, unzipFiles, false, resolve, reject);}));
            resolveParent(0);
          });
        } else { // Upload files & directories
          // let path = '';

          // for (let i = 0; i < incomingFiles.length; i++) {
          //   let splittedPath = incomingFiles[i].name.split('/');
          //   for (let j = 0; j < splittedPath.length; j++) {
          //     if (j != splittedPath.length -1) {
          //       path += encrypt(splittedPath[j]) + '/';
          //     }
          //   }
          //   incomingFiles[i].name  = path + splittedPath[splittedPath.length - 1]
          //   path = ''
          // }

          workDone = new Promise(function(resolveParent, rejectParent){
            for(let i=0; i<incomingFiles.length; i++) {

              //In case of nested directories
              var folderDepth = incomingFiles[i].name.split('/').length-1;
              var fixedFileName = incomingFiles[i].name.split('/')[incomingFiles[i].name.split('/').length-1];
              var fixedFileSubdir = incomingFiles[i].name.split('/').splice(0, folderDepth).join('/');

              for (var j=0; j<folderDepth; j++) {
                var fileSubdirName = incomingFiles[i].name.split('/')[j];
                var fileSubdirPath = filePath+(j>0?"/"+incomingFiles[i].name.split('/').splice(0, incomingFiles[i].name.split('/').length-2).join('/'):"");
                if (!fs.existsSync(baseDir.split('/').splice(0,baseDir.split('/').length-1).join('/')+"/"+fileSubdirPath+"/"+fileSubdirName)) {
                  promises.push(new Promise(function(resolve, reject) { createDirectory(fileSubdirPath, 0, fileSubdirName, baseDir, userId, unzipFiles, true, resolve, reject); }))
                }
              }

              promises.push(new Promise(function(resolve, reject) { createFile(fixedFileName, incomingFiles[i].path, filePath, fixedFileSubdir, userId, resolve, reject);}));
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
            // for (let i = 0; i < finalResponse.files.length; i++) {
            //   finalResponse.files[i].file.name = decrypt(finalResponse.files[i].file.name)
            // }
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

  let path = req.query.path.split('/')
  
  // if (path.length > 2) { // The path is the path of a directory and not a file
  //   let path = '';
    
  //   let splittedPath = req.query.path.split('/');
  //   for (let i = 2; i < splittedPath.length; i++) {
  //     path += encrypt(splittedPath[i]) + '/';
  //   }
  //   req.query.path = splittedPath[0] + '/' + splittedPath[1] + '/' + path.slice(0, -1)
  // }

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
    // for (let i = 0; i < resp.length; i++) {
    //   resp[i].file.name = decrypt(resp[i].file.name)
    // }
    res.send(resp);
  });
}

async function createDirectory(dirPath, filePathDepth, dirName, baseDir, userId, unzipFiles, dirUpload, resolve, reject) {
  let folder = {
    'name': dirName,
    'path': "/"+dirPath,
    'type': 'd'
  }

  // Creating dir on file system
  if (unzipFiles) {
    dirPath = dirPath.split('/').splice(filePathDepth+1, dirPath.split('/').length-2).join('/');
  }
  else if(dirUpload) {
    dirPath = dirPath.split('/').splice(1, dirPath.split('/').length-1).join('/');
  }

    
  try {
    if(fs.existsSync(baseDir+(unzipFiles||dirUpload?(dirPath.length>0?"/"+dirPath:"")+"/"+dirName:""))) { reject("Directory already exists"); return;}
    fs.ensureDirSync(baseDir+(unzipFiles||dirUpload?(dirPath.length>0?"/"+dirPath:"")+"/"+dirName:""));
  }
  catch (err) {
    reject(err);
    return;
  }

  var folderId;

  try {
    fileCtrl.insert(folder).then(
      insertedFolder => {
        folder = insertedFolder.toObject();
        folderId = folder._id;

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
      }
    );
  } catch(err) {
    reject(err);
  }
}

async function createFile(fileName, nestedFilePath, filePath, subdirPath, userId, resolve, reject) { // chiffrer les fichiers
  //Adding perm to DB
  // const encryptedFileName = encrypt(fileName)
  let fileToUpload = {
    // 'name': fileName,
    'name': fileName,
    'path': "/" + filePath + (subdirPath.length > 0 ? "/" + subdirPath : ""),
    'type': 'f'
  };

  //Moving file
  try {
    fileName = __dirname + "/../userDirectory/" + filePath + "/" + (subdirPath.length > 0 ? subdirPath + "/" : "") + fileName;
    fs.moveSync(nestedFilePath, fileName);
    encryptor.encryptFile(fileName, fileName + '.dat', encryptionSecret, err => {
      fs.removeSync(fileName);
      fs.renameSync(fileName + '.dat', fileName)
    })
  } catch(err) {
    reject(err);
    return;
  }

  var fileId;

  fileCtrl.insert(fileToUpload).then(
    insertedFile => {
      fileToUpload = insertedFile.toObject();
      fileId = fileToUpload._id
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
      ).catch (err => { throw err; });
    }
  ).catch(err => { reject(err) });
}

async function createFileFromZip(file, fileName, filePath, subdirPath, subdirName, userId, resolve, reject) { // chiffrer les fichiers

  try {
    if (fs.existsSync(filePath + "/" + fileName)) { reject("File already exists"); return; }
    encryptor.encryptFile(file, filePath + "/" + fileName + '.dat', encryptionSecret, (err) =>{
      console.log('encryption successful!')
    })
    fs.writeFileSync(filePath + "/" +   fileName, file);
  }
  catch(err) {
    reject(err);
    return;
  }

  var subdirFileName = fileName.split('/').splice(fileName.split('/').length - 1, 1).join('/');
  var subdirFilePath = fileName.split('/').splice(0, fileName.split('/').length - 1).join('/');
  
  //Adding perm to DB
  let fileToUpload = {
    'name': subdirFileName,
    'path': ((subdirPath.length > 0 ? "/" : "") + subdirPath + "/" + subdirName + (subdirFilePath.length > 0 ? "/" + subdirFilePath : "")),
    'type': 'f'
  };

  var fileId;

  fileCtrl.insert(fileToUpload).then(
    insertedFile => {
      fileToUpload = insertedFile.toObject();
      fileId = fileToUpload._id;

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
      ).catch(err => { throw err });
    }
  ).catch(err => { reject(err) });
}