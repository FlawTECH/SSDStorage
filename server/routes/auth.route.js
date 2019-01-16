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

const router = express.Router();
module.exports = router;

router.post('/register', asyncHandler(register), login);
router.get('/qrcode', asyncHandler(generatesQr));
router.post('/token', asyncHandler(checkToken));
router.post('/login', passport.authenticate('local', { session: false }), login);
router.get('/me', passport.authenticate('jwt', { session: false }), login);

async function register(req, res, next) {
  try {
    let user = await userCtrl.insert(req.body, secret);
    user = user.toObject();
    delete user.hashedPassword;
    req.user = user;
    next()
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

async function generatesQr(req, res) {
  const secret = speakeasy.generateSecret();
  const qrcode_uri = await qrcode.toDataURL(secret.otpauth_url);
  const id = uniqid();
  fs.appendFileSync('secret.tmp', id + ':' + secret.base32 + '\n');
  testToken(secret)
  res.json({id, qrcode_uri})
}

function testToken(secret) {
  // TEST
  const testToken = speakeasy.totp({
    secret: secret.base32,
    encoding: 'base32'
  })

  const verify = speakeasy.totp.verify({
    secret: secret.base32,
    encoding: 'base32',
    token: testToken.toString()
  })

  console.log(verify, testToken)
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
        console.log('Token ok')
        return res.status(200).end()
      }
    }
  });

  res.status(400).json({error: 'Token is not valid'})
}

function login(req, res) {
  const user = req.user;
  const token = authCtrl.generateToken(user);
  res.json({ user, token });
}
