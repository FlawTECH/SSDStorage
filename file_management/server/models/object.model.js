const mongoose = require('mongoose');
const _ = require('lodash');

const ObjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  userOwner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
  },
  usersAuth: [
    {
        _id: false,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        permissions: [{
            type: String
        }]
    }
  ],
  groupOwner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  groupsAuth: [
    {
        _id: false,
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        permissions: [{
            type: String
        }]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
}, {
  versionKey: false
});

ObjectSchema.methods.toJSON = function () {
    var object = this;
    var value = object.toObject();

    return _.pick(value, ['_id', 'name','path','type', 'userOwner', 'usersAuth', 'groupsAuth']);
};


module.exports = mongoose.model('Object', ObjectSchema);