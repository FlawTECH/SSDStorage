const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const userGroupCtl = require('../controllers/userGroup.controller');

const router = express.Router();
module.exports = router;

router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert));


async function insert(req, res) {
  let userGroup = await userGroupCtl.insert(req.body);
  userGroup = userGroup.toObject();
  res.json(userGroup);
}
