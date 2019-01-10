const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const userStateCtl = require('../controllers/userState.controller');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert));


async function insert(req, res) {
  let userState = await userStateCtl.insert(req.body);
  userState = userState.toObject();
  res.json(userState);
}
