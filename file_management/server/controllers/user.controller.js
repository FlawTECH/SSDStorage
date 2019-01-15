const User = require('../models/user.model');
var {mongoose} = require('../db/mongoose');


async function query() {
  return await User.find().then((users)=>{
      return users;
  }).catch((e)=>{
      console.log(e);
      return e;
  });
}

module.exports = {
    query
};
  