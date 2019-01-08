const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');

module.exports = router;

router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert));


async function insert(req, res) {
  let user = await userCtrl.insert(req.body);
  res.json(user);
}
