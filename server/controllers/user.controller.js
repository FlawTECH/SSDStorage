const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/user.model');
const WrongStatusError = require('../errors').WrongStatusError
const fs = require('fs');


const userSchema = Joi.object({
  fullname: Joi.string().required(),
  status: Joi.string().required().regex(/^Waiting$|^Active$|^Deleted$|^Deactivated$/),
  password: Joi.string().required(),
  repeatPassword: Joi.string().required().valid(Joi.ref('password')),
  roles: Joi.array().required(),
})

const states = {
  WAITING: "Waiting",
  ACTIVE: "Active",
  DEACTIVATED: "Deactivated",
  DELETED: "Deleted"
}

async function insert(user) {
  console.log(user)
  if (user.roles.indexOf('admin') > -1 && user.status !== "Active")
    throw new WrongStatusError ('An admin must be active when registering')
  if (user.roles.indexOf('admin') < 0 && user.status !== "Waiting")
    throw new WrongStatusError ('A user must be waiting when registering')
  // user = await Joi.validate(user, userSchema, { abortEarly: false });
  // user.hashedPassword = bcrypt.hashSync(user.password, 10);
  // delete user.password;
  // await UserState.findOne({name: 'DISABLED'}, async function(err, res) {
  //   user.stateId = res._id;
  //   console.log(res);
  //   // dbUser.stateId.push(res);
  // });
  // return await new User(user).save();
  user = await Joi.validate(user, userSchema, { abortEarly: false });
  user.hashedPassword = bcrypt.hashSync(user.password, 10);
  delete user.password;
  return await new User(user).save();
}

function setStatus(id, newStatus, callback) {
  User.findById(id, (err, doc) => {
    if (err || !doc) {
      return callback (err, doc)
    }

    if (Object.values(states).indexOf(newStatus) < 0) {
      return callback(new WrongStatusError ('Status does not exist'), null)
    }

    if (doc.roles.indexOf('admin') > -1) {
      return callback(new WrongStatusError ('An admin can not change the status of another admin'), null)
    }

    if (doc.status == states.DELETED) {
      return callback(new WrongStatusError('A deleted user can not change status'), null)
    }

    if (newStatus == states.WAITING) {
      return callback(new WrongStatusError ('A user can not go back to waiting status'), null)
    }
    
    if (doc.status == states.WAITING && newStatus != states.ACTIVE) {
      return callback(new WrongStatusError ('You can not deactivate a user who is not active'), null)
    }
    
    User.updateOne(doc, {'status': newStatus}, (err, doc) => {
      callback(err, doc)
    })
    createDirectory(doc);
  })
}

function createDirectory(doc) {
  fullname = bcrypt.hashSync(doc.fullname, 10);
  var dir = __dirname + "/../userDirectory/"+ fullname;
  if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
  }
}

module.exports = {
  insert,
  setStatus
}