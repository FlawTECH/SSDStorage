const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/user.model');
const WrongStatusError = require('../errors').WrongStatusError

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
  if (user.roles.indexOf('admin') > -1 && user.status !== "Active")
    throw new WrongStatusError ('An admin must be active when registering')
  if (user.roles.indexOf('admin') < 0 && user.status !== "Waiting")
    throw new WrongStatusError ('A user must be waiting when registering')

  user = await Joi.validate(user, userSchema, { abortEarly: false });
  user.hashedPassword = bcrypt.hashSync(user.password, 10);
  delete user.password;
  return await new User(user).save();
}

function setStatus(id, newStatus, callback) {
  User.findById(id, (err, doc) => {
    if (err || !doc) {
      callback (err, doc)
      return
    }

    if (Object.values(states).indexOf(newStatus) < 0) {
      callback(new WrongStatusError ('Status does not exist'), null)
      return
    }

    if (doc.roles.indexOf('admin') > -1) {
      callback(new WrongStatusError ('An admin can not change the status of another admin'))
      return 
    }

    if (doc.status == states.DELETED) {
      callback(new WrongStatusError('A deleted user can not change status'), null)
    }
    
    if (doc.status == states.WAITING && newStatus == states.DEACTIVATED) {
      callback(new WrongStatusError ('You can not deactivate a user who is not active'), null)
      return 
    }
    
    if (doc.status == states.ACTIVE && newStatus == states.WAITING) {
      callback(new WrongStatusError('You can only deactivate or delete an active user'), null)
      return
    }

    if (doc.status == states.DEACTIVATED && newStatus != states.ACTIVE) {
      callback(new WrongStatusError('A deactivated user can only go back to active status'), null)
      return 
    }

    User.updateOne(doc, {'status': newStatus}, (err, doc) => {
      callback(err, doc)
    })
  })
}

module.exports = {
  insert,
  setStatus
}