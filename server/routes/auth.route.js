const express = require('express');
const asyncHandler = require('express-async-handler')
const passport = require('passport');
const userCtrl = require('../controllers/user.controller');
const authCtrl = require('../controllers/auth.controller');
const qrcode = require('qrcode');
const speakeasy = require('speakeasy');
const fs = require('fs');
const jwtDecode = require("jwt-decode");

const router = express.Router();
module.exports = router;

router.post('/register', asyncHandler(register), login);
router.get('/qrcode', asyncHandler(generatesQr));
router.post('/token', asyncHandler(checkToken));
router.post('/login', passport.authenticate('local', { session: false }), login);
router.get('/me', passport.authenticate('jwt', { session: false }), login);

async function register(req, res, next) {
  delete req.body.otp;
  const otp = req.body.otp
  let user = await userCtrl.insert(req.body)

  user = user.toObject();
  delete user.hashedPassword;
  req.user = user;
  req.body.otp = otp
  req.body.isRegistered = true
  next()
}

async function generatesQr(req, res) {
  let secret = speakeasy.generateSecret({name: 'NAS'});
  const qrcode_uri = await qrcode.toDataURL(secret.otpauth_url);
  secret = secret.base32;
  res.json({secret, qrcode_uri})
}

function checkToken(req, res) {
  const verified = speakeasy.totp.verify({
    secret: req.body.secret,
    encoding: 'base32',
    token: req.body.token.toString(),
  });

  if (verified) {
    res.status(200).end()
  } else {
    res.status(400).json({error: 'One time password incorrect'})
  }
}

async function login(req, res) {
  const user = req.user;
  const token = authCtrl.generateToken(user);
  const secret = await authCtrl.getOTP(user.fullname);
  var decoded = jwtDecode(token);
  
  if (!req.body.isRegistered && !user.isRegistered) {
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: req.body.otp
    })
    if (verified && decoded.status == "Active") {
      fs.appendFile(__dirname + "/../logs/logs.txt","\n" +new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') +" : User log in: " +decoded.fullname, function(err) {
      })
      res.json({ user, token });
    } else {
      res.status(401).json({error: 'One time password incorrect'})
    }
  } else {
    res.json({ user, token })
  }
}
