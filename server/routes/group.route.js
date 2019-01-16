const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const groupCtl = require('../controllers/group.controller');

const router = express.Router();
module.exports = router;

router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert));
router.route('/generate')
  .post(asyncHandler(generateGroup));

router.get('/:fileName', function(req, res){
    console.log('TEST: ' +req.params.fileName)
    });

async function generateGroup(req,res) {
  await groupCtl.generateGroup(req, res, GroupCallback);
}

async function insert(req, res) {
  let group = await groupCtl.insert(req.body);
  group = group.toObject();
  res.json(group);
}

function GroupCallback(res, info) {
  res.json(info);
}