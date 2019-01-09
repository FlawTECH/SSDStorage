const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const fileCtrl = require('../controllers/file.controller');
var formidable = require('formidable');
const testFolder = './uploads/';

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert));


async function insert(req, res) {
  
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let fileToUpload = req.files.fileToUpload;
  let path = '/../userDirectory/'+req.files.fileToUpload.name
  // Use the mv() method to place the file somewhere on your server
  fileToUpload.mv(path, function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });


  var filet = {
    name: req.files.fileToUpload.name,
    path: path
  };
  
  let file = await fileCtrl.insert(filet);
  
  file = file.toObject();

  res.json(file);
}
