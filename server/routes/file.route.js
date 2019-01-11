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
const mongoose = require('mongoose');

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
  
  var form = new formidable.IncomingForm();
  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
  
  //Checking if user has perm to write there
  let FilePermissionsModel = mongoose.model('FilePermissions');
  let FileModel = mongoose.model('File');
  let userId;
  
  await User.findOne({
    fullname: decoded.fullname
  }, (err, res) => {
    userId = res._id;
  });

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
      { "file.path": req.path },
      { "write": true }
    ]}}
  ],
  function(err, resp) {
    console.log(err);
    console.log("lol");
    console.log(resp);
  });


  form.parse(req);

  form.on('fileBegin', function (name, file) {
    file.path = __dirname + '/../userDirectory/'+decoded.fullname+'/'+file.name;
  });

  form.on('file', async function (name, file) {
    let fileToUpload;
    fileToUpload = {
      'name': file.name,
      'path': decoded.fullname,
      'type': 'f'
    };

    fileToUpload = await fileCtrl.insert(fileToUpload);
    fileToUpload = fileToUpload.toObject();


    var fileId;

    await Filedb.findOne({
      name: fileToUpload.name
    }, (err, res) => {
      fileId = res._id;
    });

    permissionToCreate = {
      'fileId': fileId,
      'userId': userId,
      'read': true,
      'write': true,
      'delete': true,
      'isOwner': true,
    };
    permissionToCreate = await persmissionCtrl.insert(permissionToCreate);

    let craftedResponse = {
      'file': file,
      'perm': permissionToCreate
    }
    
    res.json(craftedResponse);
  });
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
      { "file.path": __dirname+"../userDirectory/"+req.query.path }
    ]}}
  ],
  function(err, resp) {
    res.send(resp);
 });
}
