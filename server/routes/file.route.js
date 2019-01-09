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
  
 var form = new formidable.IncomingForm();

  form.parse(req);

  form.on('fileBegin', function (name, file){
      file.path = __dirname + '/../userDirectory/' + file.name;
      
  });

  
  form.on('file', async function (name, file){
    let fileToUpload;
    fileToUpload = {
        'name': file.name,
        'path': file.path,
        'type': 'f'
      };
      console.log('Uploaded ' + file.name + ' to ' + file.path);

      fileToUpload = await fileCtrl.insert(fileToUpload);
      fileToUpload = fileToUpload.toObject();
      res.json(file);
  });
}
