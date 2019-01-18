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
router.route('/checkStatusDownloadFile')
  .post(asyncHandler(checkStatusDownloadFile)); 
router.route('/changeStatusGroupFile')
  .post(asyncHandler(changeStatusGroupFile));

router.get('/:groupName', function(req, res){
    asyncHandler(joinGroup(req,res));
    });

async function changeStatusGroupFile(req,res) {
  await groupCtl.changeStatusGroupFile(req, res, GroupCallback);
}

async function checkStatusDownloadFile(req,res) {
  await groupCtl.checkStatusDownloadFile(req, res, GroupCallback);
}

async function joinGroup(req,res) {
  await groupCtl.joinGroup(req, res, GroupCallback);
}

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