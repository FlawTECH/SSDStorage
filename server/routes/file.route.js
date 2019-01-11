const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const fileCtrl = require('../controllers/file.controller');


const router = express.Router();
module.exports = router;

router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert));


async function insert(req, res) {
  let file = await fileCtrl.insert(req.body);
  file = file.toObject();
  res.json(file);
}
