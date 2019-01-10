const express = require('express');
const passport = require('passport');
const passportjwt = require('passport-jwt');
const asyncHandler = require('express-async-handler');
const fileCtrl = require('../controllers/file.controller');
const persmissionCtrl = require('../controllers/filePermissions.controller');
var formidable = require('formidable');
const testFolder = './uploads/';
const jwtDecode = require("jwt-decode");
const router = express.Router();
const User = require("../models/user.model");
const Filedb = require("../models/file.model");

module.exports = router;

router.use(passport.authenticate('jwt', {
  session: false
}))

router.route('/')
  .post(asyncHandler(insert));
router.route('/')
  .get(asyncHandler(getFileListByUserId));

async function insert(req, res) {

  var form = new formidable.IncomingForm();



  form.parse(req);

  form.on('fileBegin', function (name, file) {
    file.path = __dirname + '/../userDirectory/' + file.name;

  });


  form.on('file', async function (name, file) {
    let fileToUpload;
    fileToUpload = {
      'name': file.name,
      'path': file.path,
      'type': 'f'
    };
    console.log('Uploaded ' + file.name + ' to ' + file.path);

    fileToUpload = await fileCtrl.insert(fileToUpload);

    var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);


    fileToUpload = fileToUpload.toObject();


    var fileId, userId;

    await Filedb.findOne({
      name: fileToUpload.name
    }, (err, res) => {
      fileId = res._id;
    });
    await User.findOne({
      name: decoded.name
    }, (err, res) => {
      userId = res._id;
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

    res.json(file + persmissionCtrl);
  });
}

async function getFileListByUserId(req, res) {

  var decoded = jwtDecode(req.headers.authorization.split(' ')[1]);

  
  

  Filedb.collection.find({
    userId: User.findOne({
      name: decoded.name
    })._id
  }).toArray(function (error, documents) {
    if (error) throw error;

    res.send(documents);
  });
}
