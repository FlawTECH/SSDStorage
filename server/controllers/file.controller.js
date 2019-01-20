const Joi = require('joi');
const File = require('../models/file.model');
const FilePermissions = require('../models/filePermissions.model');
const jwtDecode = require("jwt-decode");
const mongoose = require('mongoose');
const fs = require('fs-extra');
const jszip = require('jszip');
const tmp = require('tmp');
const os = require('os');
const encrypt = require('../cryptoUtil').encrypt;

const FileSchema = Joi.object({
  name: Joi.string().required(),
  path: Joi.string().required(),
  type: Joi.string().required()
})

module.exports = {
  insert,
  deleteFile,
  renameFile,
  moveFile,
  downloadDir
}

function moveFile(req,res,callback) {  // Receive FileObject with new path
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  var userid = decoded._id;
  req = req.body;
  var newvalues = { $set: {path: req.path } };
  if (decoded.roles.indexOf('admin') == 0) { // Check if user is admin and ifso change file's path in DB + move file
    File.findByIdAndUpdate(req._id, newvalues,  function(err,file) {
      if (err) throw err;
      fs.stat(__dirname+"/../userDirectory/"+file.path+"/"+file.name, function (err, stats) {
        if (err) {
            return console.error(err);
        }               
        fs.rename(__dirname+"/../userDirectory/"+file.path+"/"+file.name, __dirname+"/../userDirectory/"+req.path+"/"+file.name, function (err) {
          if (err) throw err;
          console.log('File ' +file.name +' moved to: ' +req.path);
        })
      });
    }); 
  } else {
    FilePermissions.findOne({fileId:req._id, userId:userid, write: true}).exec(function(err, filePerm){
      if(Object.keys(filePerm).length !== 0){ // If FilePermissions.query return something
        if(req.path.slice(-1) == "/"){
          req.path = req.path.slice(0,-1);
        }
        lastDirectory = req.path.split("/");
        if (lastDirectory != decoded.fullname){
          lastDirectory = lastDirectory[lastDirectory.length-1];
          pathLastDirectory = req.path.slice(0,-lastDirectory.length-1);
        } else { 
          pathLastDirectory = "/";
        }
        File.findOne({name:lastDirectory, path:pathLastDirectory}).exec(function(err, fileInfo){
          if(Object.keys(fileInfo).length !== 0){
            fileid = fileInfo._id;
            FilePermissions.findOne({fileId:fileid, userId:userid, write: true}).exec(function(err, filePermLastDirectory){
              if(Object.keys(filePermLastDirectory).length !== 0){
                File.findByIdAndUpdate(req._id, newvalues,  function(err,file) {
                  if(err) throw err;
                  fs.stat(__dirname+"/../userDirectory/"+file.path+"/"+file.name, function (err, stats) {
                    if (err) {
                        return console.error(err);
                    }               
                    fs.rename(__dirname+"/../userDirectory/"+file.path+"/"+file.name, __dirname+"/../userDirectory/"+req.path+"/"+file.name, function (err) {
                      if (err) throw err;
                      console.log('File ' +file.name +' moved to: ' +req.path);
                    })
                  });
                }); 
              }    
            });
          }
        });
      }
    });
  }
}

function renameFile(req,res,callback) {  // Receive fileId + name
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  var userid = decoded._id;
  req = req.body;
  req.name = encrypt(req.name)
  var newvalues = { $set: {name: req.name } };
  var finalResponse = Object.assign({
    'message': "Success"
  });
  if(decoded.roles.indexOf('admin') == 0) { // Check if user is admin and ifso rename  file entries in DB + file in userDirectory
    File.findByIdAndUpdate(req.fileId, newvalues,  function(err,file) {
      if(err) throw err;
      try {
        fs.stat(__dirname+"/../userDirectory/"+file.path+"/"+file.name, function (err, stats) {
          if (err) {
              return console.error(err);
          }         
          fs.rename(__dirname+"/../userDirectory/"+file.path+"/"+file.name, __dirname+"/../userDirectory/"+file.path+"/"+req.name, function (err) {
            if (err) throw err;
            console.log('File ' +file.name +' renamed to: ' +req.name);
            callback(res, finalResponse);
          })
        });
      } catch (error) {
      finalResponse.message="Error";
      callback(res,finalResponse);
      }
    });  
  }else{
    FilePermissions.findOne({fileId:req.fileId, userId:userid, write: true}).exec(function(err, filePerm){
      try {
        if(Object.keys(filePerm).length !== 0){ // If query return something
          File.findByIdAndUpdate(req.fileId, newvalues,  function(err,file) {
            if(err) throw err;
            fs.stat(__dirname+"/../userDirectory/"+file.path+"/"+file.name, function (err, stats) {
              if (err) {
                  return console.error(err);
              }         
              fs.rename(__dirname+"/../userDirectory/"+file.path+"/"+file.name, __dirname+"/../userDirectory/"+file.path+"/"+req.name, function (err) {
                if (err) throw err;
                console.log('File ' +file.name +' renamed to: ' +req.name);
                callback(res, finalResponse);
              })
            });
          });  
        }
        
      } catch (error) {
      finalResponse.message="Error";
      callback(res,finalResponse);
      }
    });
  }
}

function deleteFile(req,res, callback) { // Receive fileId
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  var userid = decoded._id;
  req = req.body;
  var finalResponse = Object.assign({
    'message': "Success"
  });
  if (decoded.roles.indexOf('admin') == 0) { // Check if user is admin and ifso delete all filepermissions and file entries in DB + file in userDirectory
    FilePermissions.find({fileId:req.fileId}).remove().exec(function(err, filePerm){
      console.log('Filepermissions deleted successfully!');
      try {
        if (Object.keys(filePerm).length !== 0) {
          File.findByIdAndDelete(req.fileId, function(err, file) {
            if (err) throw err;
            console.log('File with Id: ' + req.fileId + ' deleted in the database!')
            fs.access(__dirname+"/../userDirectory/"+file.path+"/"+file.name, fs.constants.F_OK, function (err, stats) {
              if (err) {
                  return console.error(err);
              }
              if (file.type == "d") {
                fs.rmdir(__dirname+"/../userDirectory/" + file.path + "/" + file.name, function(err){
                  if(err) return console.log(err);
                  console.log('Directory deleted successfully!');
                  callback(res, finalResponse);
                });  
              } else {
                fs.unlink(__dirname + "/../userDirectory/" + file.path + "/" + file.name, function(err){
                  if(err) return console.log(err);
                  console.log('file deleted successfully!');
                  callback(res, finalResponse);
              });  
              }      
            });
          });
        } 
      } catch (error) {
        finalResponse.message="Error";
      callback(res,finalResponse);
      }
    });
  } else { // Check if user is owner and ifso delete all filepermissions and file entries in DB + file in userDirectory
    FilePermissions.findOneAndDelete({fileId:req.fileId, userId:userid, delete: true}).exec(function(err, filePerm){
      console.log('Filepermissions deleted successfully!');
      try {
        if(Object.keys(filePerm).length !== 0){
          File.findByIdAndDelete(req.fileId, function(err,file) {
            if(err) throw err;
            console.log('File with Id: '+req.fileId +' deleted in the database!')
            fs.access(__dirname+"/../userDirectory/"+file.path+"/"+file.name,fs.constants.F_OK, function (err, stats) {
              if (err) {
                  return console.error(err);
              }  
              if(file.type=="d"){
                fs.rmdir(__dirname+"/../userDirectory/"+file.path+"/"+file.name,function(err){
                  if(err) return console.log(err);
                  console.log('Directory deleted successfully!');
            });  
              }else {
                fs.unlink(__dirname+"/../userDirectory/"+file.path+"/"+file.name,function(err){
                  if(err) return console.log(err);
                  console.log('file deleted successfully!');
            });  
              }     
            });
          });
        }
        FilePermissions.find({fileId:req.fileId}).remove().exec(function(err){
          if(err) return console.log(err);
          callback(res, finalResponse);
        });
        console.log('All filepermissions deleted successfully!');
      } catch (error) {
        finalResponse.message="Error";
        callback(res,finalResponse);
      }
    });
  }
}

async function insert(file) {
  file = await Joi.validate(file, FileSchema, { abortEarly: false });
  
  let newFile = await new File(file).save();
  return newFile;
}

function downloadDir(req) {
  return new Promise((resolve, reject) => {
    var baseDir = Joi.validate(req.body, FileSchema, { abortEarly: false });
    var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  
    listFilesFromDir(baseDir.value, decoded).then((files) => {
      //Download all files as ZIP
      if(files.length>0) {
        var generatedZip = generateZipFromFiles(files, baseDir.value.path+"/"+baseDir.value.name);
        resolve(generatedZip);
      }
      else {
        reject("No files found or not a directory");
      }
    });
  });
}

function listFilesFromDir(file, user) {
  return new Promise((resolve, reject) => {
    var fullPathRegexReady = ("/"+file.path+"/"+file.name).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var combinedPathRegexReady = new RegExp("^"+fullPathRegexReady+"\/?.*");
    console.log(file);

    FilePermissions.aggregate([
      {
        "$lookup": {
          "from": File.collection.name,
          "localField": "fileId",
          "foreignField": "_id",
          "as": "file"
        }
      },
      { "$unwind": "$file" },
      { "$match": { "$and": [
        { "userId": new mongoose.Types.ObjectId(user._id) },
        { "file.path": {"$regex": combinedPathRegexReady } },
        { "read": true }
      ]}}
    ]).then((filesFound) => {
      resolve(filesFound);
    });
  });
}

function generateZipFromFiles(files, fromDir) {
  return new Promise((resolve, reject) => {
    var baseDir =  __dirname+"/../"+"userDirectory";
    var zip = new jszip();

    for(var i = 0; i<files.length; i++) {
      if(fs.existsSync(baseDir+files[i].file.path+"/"+files[i].file.name)) {
        if(files[i].file.type === "d") {
          zip.folder(files[i].file.path.substr(1, files[i].file.path.length-1)+"/"+files[i].file.name);
        }
        else {
          zip.file(files[i].file.path.substr(1, files[i].file.path.length-1)+"/"+files[i].file.name, fs.readFileSync(baseDir+files[i].file.path+"/"+files[i].file.name));
        }
      }
    }
    var tmpDir = tmp.dirSync(os.tmpdir());
    fs.ensureDirSync(tmpDir.name+"/"+fromDir.split('/').splice(0, fromDir.split('/').length-1).join('/'));

    zip.generateNodeStream({type:'nodebuffer', streamFiles:true})
    .pipe(fs.createWriteStream(tmpDir.name+"/"+fromDir+".zip"))
    .on('finish', function() {
      resolve(tmpDir.name+"/"+fromDir+".zip");
    });
  });
}