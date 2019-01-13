const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const userCtrl = require('../controllers/user.controller');
const requireAdmin = require('../middleware/require-admin')
const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert))
  .put(asyncHandler(setStatus));

async function insert(req, res) { // might have to delete this function later since it's not used atm
  const user = await userCtrl.insert(req.body);
  console.log("test: "+req.body)
  res.json(user);
}

async function setStatus(req, res) {
  requireAdmin(req, res, async (err) => {
    if (err) res.json(401).json({error: "You must be admin to change a user's status"})
    
    userCtrl.setStatus(req.body._id, req.body.status, (err, user) => {
      if (err)
        res.status(400).json({error: err.message})
      else if (!user)
        res.status(500).json({error: "You are trying to change the status of a user that does not exist"})
      else
        res.json(user)
    })
  })
}

module.exports = router;
