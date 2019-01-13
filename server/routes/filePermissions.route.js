const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const filePermissionsCtl = require('../controllers/filePermissions.controller');

const router = express.Router();
module.exports = router;

router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert))
  .put(asyncHandler(changePermissions));


async function insert(req, res) {
  let filePermissions = await filePermissionsCtl.insert(req.body);
  filePermissions = filePermissions.toObject();
  res.json(filePermissions);
}

async function changePermissions(req, res) {
    
    filePermissionsCtl.changePermissions(req, (err, filePermissions) => {
      if (err)
        res.status(400).json({error: err.message})
      else if (!filePermissions)
        res.status(500).json({error: "You are trying to change the permissions of a file  wihtout informations"})
      else
        res.json(filePermissions)
    })
}
