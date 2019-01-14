const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const userCtrl = require('../controllers/user.controller');
const requireAdmin = require('../middleware/require-admin')
const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert))
  .put(asyncHandler(setStatus))
  .get(asyncHandler(getAllNonActive));

async function insert(req, res) { // might have to delete this function later since it's not used atm
  const user = await userCtrl.insert(req.body);
  res.json(user);
}

async function setStatus(req, res) {
  requireAdmin(req, res, async (err) => {
    if (err) res.json(401).json({error: "You must be admin to change a user's status"})
    
    userCtrl.setStatus(req.body, (err, user) => {
      console.log(req.body)
      if (err){
        console.log("YOOOOOO", err)
        return res.status(400).json({error: err.message})
      }
      else if (!user){
        console.log("test")
        res.status(500).json({error: "You are trying to change the status of a user that does not exist"})
      }
      else {
        console.log(err, user)
        res.json(user)
      }
    })
  })
}

async function getAllNonActive(req, res){
  requireAdmin(req, res, async(err) => {
    if (err) {
      res.json(401).json({error: "You must be admin to change a user's status"})
    }
    const users = await userCtrl.getAllNonActive();
    res.json(users)
  })
}

module.exports = router;
