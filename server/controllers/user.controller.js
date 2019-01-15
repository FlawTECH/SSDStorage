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
  user.roles = []
  if (user.roles.indexOf('admin') > -1 && user.status !== "Active")
    throw new WrongStatusError ('An admin must be active when registering')
  if (user.roles.indexOf('admin') < 0 && user.status !== "Waiting")
    throw new WrongStatusError ('A user must be waiting when registering')
  user = await Joi.validate(user, userSchema, { abortEarly: false });
  user.hashedPassword = bcrypt.hashSync(user.password, 10);
  delete user.password;
  return await new User(user).save();
}

async function setStatus(user) {
  let userDb
  
  try {
    userDb = await User.findById(user._id)
  } catch (e) {
    e.message = "You are trying to change the status of a user that does not exist"
    throw e
  }
  
  const newStatus = user.newStatus;
  
  if (Object.values(states).indexOf(newStatus) < 0) 
    throw new WrongStatusError('Status does not exist')

  if (userDb.roles.indexOf('admin') > -1) 
    throw new WrongStatusError('An admin can not change the status of another admin')

  if (userDb.status == states.DELETED)
    throw new WrongStatusError('A deleted user can not change status')

  if (newStatus == states.WAITING)
    throw new WrongStatusError ('A user can not go back to waiting status')
  
  if (userDb.status == states.WAITING && newStatus == states.DEACTIVATED)
    throw new WrongStatusError ('You can not deactivate a user who is not active')

  if (! await User.updateOne(userDb, {'status': newStatus}))
    throw new Error("Update Error")
}

async function getAllNonActive() {
  return await User.find(
    { $and: [
      { $or: [{ status: "Waiting" }, { status: "Active" }, {status: "Deactivated"}] },
      { roles: {$nin: ['admin']} }
    ]}, 
    { fullname: 1, status: 1, });
}

module.exports = {
  insert,
  setStatus,
  getAllNonActive
}