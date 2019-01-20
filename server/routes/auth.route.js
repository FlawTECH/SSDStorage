const express = require('express');
const asyncHandler = require('express-async-handler')
const passport = require('passport');
const userCtrl = require('../controllers/user.controller');
const authCtrl = require('../controllers/auth.controller');
const config = require('../config/config');
const qrcode = require('qrcode');
const speakeasy = require('speakeasy');
const uniqid= require('uniqid');
const fs = require('fs');
const readline = require('readline');
const jwtDecode = require("jwt-decode");

const router = express.Router();
module.exports = router;

router.post('/register', asyncHandler(register), login);
router.get('/qrcode', asyncHandler(generatesQr));
router.post('/token', asyncHandler(checkToken));
router.post('/login', passport.authenticate('local', { session: false }), login);
router.get('/me', passport.authenticate('jwt', { session: false }), login);

async function register(req, res, next) {
  getSecret(req.body.tmpId).then(async secret => {
    req.body.secret = secret;
    delete req.body.tmpId;
    delete req.body.otp;
    const otp = req.body.otp
    let user = await userCtrl.insert(req.body)

    user = user.toObject();
    delete user.hashedPassword;
    req.user = user;
    req.body.otp = otp
    req.body.isRegistered = true
    next()
  }).catch(err => {
    res.status(400).json({error: err.message})
  })
}

async function getSecret(id) {
  return new Promise(resolve => {
    readline.createInterface({
      input: fs.createReadStream('secret.tmp')
    }).on('line', line => {
      const data = line.split(':')
      
      if (data[0] == id){
        resolve(data[1])//delete line afterward
      }
    });
  })
}

async function generatesQr(req, res) {
  const secret = speakeasy.generateSecret({name: 'NAS'});
  const qrcode_uri = await qrcode.toDataURL(secret.otpauth_url);
  const id = uniqid();
  fs.appendFileSync('secret.tmp', id + ':' + secret.base32 + '\n');
  res.json({id, qrcode_uri})
}

function checkToken(req, res) {
  readline.createInterface({
    input: fs.createReadStream('secret.tmp')
  }).on('line', line => {
    
    const data = line.split(':')

    if (data[0] == req.body.id) {
      const verified = speakeasy.totp.verify({
        secret: data[1],
        encoding: 'base32',
        token: req.body.token.toString(),
      });

      if (verified) {
        res.status(200).end()
      } else {
        res.status(400).json({error: 'Token is not valid'})
      }
    }
  });
}

async function login(req, res) {
  const user = req.user;
  const token = authCtrl.generateToken(user);
  const secret = await authCtrl.getOTP(user.fullname);
  var decoded = jwtDecode(token);

  if (!req.body.isRegistered) {
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
