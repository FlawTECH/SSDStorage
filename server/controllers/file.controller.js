const Joi = require('joi');
const File = require('../models/file.model');
const FilePermissions = require('../models/filePermissions.model');
const jwtDecode = require("jwt-decode");
const User = require('../models/user.model');
const fs = require('fs');


const FileSchema = Joi.object({
  name: Joi.string().required(),
  path: Joi.string().required(),
  type: Joi.string().required()
})

module.exports = {
  insert,
  deleteFile,
  renameFile,
  moveFile
}

function moveFile(req,res) {  // Receive FileObject with new path
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  var userid = decoded._id;
  req = req.body;
  var newvalues = { $set: {path: req.path } };
  if(decoded.roles.indexOf('admin') == 0) { // Check if user is admin and ifso change file's path in DB + move file
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
  }else{
    FilePermissions.findOne({fileId:req._id, userId:userid, write: true}).exec(function(err, filePerm){
      // TODO : TRY CATCH autour de cet objet.keys sinon crash de l'app si on change une valeur de req.body._id
      if(Object.keys(filePerm).length !== 0){ // If FilePermissions.query return something
        if(req.path.slice(-1) == "/"){
          req.path = req.path.slice(0,-1);
        }
        lastDirectory = req.path.split("/");
        console.log("1: "+lastDirectory)
        if(lastDirectory != decoded.fullname){
          lastDirectory = lastDirectory[lastDirectory.length-1];
          pathLastDirectory = req.path.slice(0,-lastDirectory.length-1);
        }else{
          pathLastDirectory = "/";
        }
        
        console.log("2: "+pathLastDirectory)
        File.findOne({name:lastDirectory, path:pathLastDirectory}).exec(function(err, fileInfo){
          console.log("3: "+fileInfo)
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


function renameFile(req,res) {  // Receive fileId + name
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  var userid = decoded._id;
  req = req.body;
  var newvalues = { $set: {name: req.name } };
  if(decoded.roles.indexOf('admin') == 0) { // Check if user is admin and ifso rename  file entries in DB + file in userDirectory
    File.findByIdAndUpdate(req.fileId, newvalues,  function(err,file) {
      if(err) throw err;
      fs.stat(__dirname+"/../userDirectory/"+file.path+"/"+file.name, function (err, stats) {
        if (err) {
            return console.error(err);
        }         
        fs.rename(__dirname+"/../userDirectory/"+file.path+"/"+file.name, __dirname+"/../userDirectory/"+file.path+"/"+req.name, function (err) {
          if (err) throw err;
          console.log('File ' +file.name +' renamed to: ' +req.name);
        })
      });
    });  
  }else{
    FilePermissions.findOne({fileId:req.fileId, userId:userid, write: true}).exec(function(err, filePerm){
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
            })
          });
        });  
      }
    });
  }
}

function deleteFile(req, res) { // Receive fileId
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  var userid = decoded._id;
  req = req.body;
  if(decoded.roles.indexOf('admin') == 0) { // Check if user is admin and ifso delete all filepermissions and file entries in DB + file in userDirectory
    FilePermissions.find({fileId:req.fileId}).remove().exec(function(err, filePerm){
      console.log('Filepermissions deleted successfully!');
      if(Object.keys(filePerm).length !== 0){
        File.findByIdAndDelete(req.fileId, function(err,file) {
          if(err) throw err;
          console.log('File with Id: '+req.fileId +' deleted in the database!')
          fs.stat(__dirname+"/../userDirectory/"+file.path+"/"+file.name, function (err, stats) {
            if (err) {
                return console.error(err);
            }         
            fs.unlink(__dirname+"/../userDirectory/"+file.path+"/"+file.name,function(err){
                  if(err) return console.log(err);
                  console.log('file deleted successfully!');
            });  
          });
        });
      }   
    });
  }else{ // Check if user is owner and ifso delete all filepermissions and file entries in DB + file in userDirectory
  FilePermissions.findOneAndDelete({fileId:req.fileId, userId:userid, delete: true}).exec(function(err, filePerm){
    console.log('Filepermissions deleted successfully!');
    if(Object.keys(filePerm).length !== 0){
      File.findByIdAndDelete(req.fileId, function(err,file) {
        if(err) throw err;
        console.log('File with Id: '+req.fileId +' deleted in the database!')
        fs.stat(__dirname+"/../userDirectory/"+file.path+"/"+file.name, function (err, stats) {
          if (err) {
              return console.error(err);
          }         
          fs.unlink(__dirname+"/../userDirectory/"+file.path+"/"+file.name,function(err){
                if(err) return console.log(err);
                console.log('file deleted successfully!');
          });  
        });
      });
    }   
  });
  FilePermissions.find({fileId:req.fileId}).remove().exec(function(err){
    if(err) return console.log(err);
  });
  console.log('All filepermissions deleted successfully!')
  }
}

async function insert(file) {

  console.log('File: ' +file.name+", path:"+file.path);
  file = await Joi.validate(file, FileSchema, { abortEarly: false });
  
  let newFile = await new File(file).save();
  return newFile;
}