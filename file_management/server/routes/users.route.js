var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const userCtrl = require('../controllers/user.controller');

/* GET users listing. */
router.get('/',asyncHandler(
  async (req, res) => {
    const users = await userCtrl.query();
    res.json(users);
  }
));

module.exports = router;


