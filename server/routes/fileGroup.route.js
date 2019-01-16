const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const fileGroupCtl = require('../controllers/fileGroup.controller');

const router = express.Router();
module.exports = router;

router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert));

router.get('/treshold/:group', function(req, res){
  var file = __dirname + '/../userDirectory/'+req.params.group;
  res.download(file);
});

function treshold(req,res) {
  let treshold = fileGroupCtl.treshold(req.body);
  res.json(treshold);
}

async function insert(req, res) {
  let fileGroup = await fileGroupCtl.insert(req.body);
  fileGroup = fileGroup.toObject();
  res.json(fileGroup);
}
