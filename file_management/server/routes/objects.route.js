var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const objectCtrl = require('../controllers/object.controller');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

/* GET objects listing. */
router.get('/',asyncHandler(
  async (req, res) => {
    const objects = await objectCtrl.query();
    res.json(objects);
  }
));

/* GET specific Object. */
router.get('/:id',asyncHandler(
  async (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();    
    }

    const objects = await objectCtrl.queryById(id);
    res.json(objects);
  }
));

/* PATCH Change Object. */
/*
  Param: id
  Body: {
    command: [Options: rename, move],
    [newname],
    [newpath]
  }
*/
router.patch('/:id',asyncHandler(
  async (req, res) => {
    try{
      const id = req.params.id;
      const command = req.body.command;
      console.log(req.body);
      if (!ObjectID.isValid(id)) {
        return res.status(404).send();    
      }
      let object = null;
      if(command==='rename'){
        const newname = req.body.newname;
        object = await objectCtrl.updateName(id, newname);
      }else if(command==='move'){
        const newpath = req.body.newpath;
        object = await objectCtrl.updatePath(id, newpath);
        console.log(object);
      }
      if(object){
        res.json(object);
      } else {
        res.status(400).send('Object not changed');
      }
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }   
  }
));

/* DELETE specific Object. */
router.delete('/:id',asyncHandler(
  async (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();    
    }

    const object = await objectCtrl.deleteById(id);
    if(object){
      res.json(object);
    } else {
      res.status(400).send('Object not changed');
    }
  }
));

/* PATCH Create a new user inside the UsersAuth permissions for an object. */
router.patch('/:id/addUser',asyncHandler(
  async (req, res) => {
    const id = req.params.id;
    const userId = req.body.userId;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();    
    }
    const object = await objectCtrl.assignUser(id, userId);
    if(object){
      res.json(object);
    } else {
      res.status(400).send('Object not changed');
    }
  }
));

/* PATCH Update permissions for an user to an object. */
router.patch('/:id/setUserPermissions',asyncHandler(
  async (req, res) => {
    const id = req.params.id;
    const userId = req.body.userId;
    const permissions = req.body.permissions;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();    
    }
    const object = await objectCtrl.assignPermissionsToUser(id, userId, permissions);
    if(object){
      res.json(object);
    } else {
      res.status(400).send('Object not changed');
    }
  }
));

/* PATCH Create a new group inside the GroupsAuth permissions for an object. */
router.patch('/:id/addGroup',asyncHandler(
  async (req, res) => {
    const id = req.params.id;
    const groupId = req.body.groupId;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();    
    }
    const object = await objectCtrl.assignGroup(id, groupId);
    if(object){
      res.json(object);
    } else {
      res.status(400).send('Object not changed');
    }
  }
));

/* PATCH Update permissions for a group to an object. */
router.patch('/:id/setGroupPermissions',asyncHandler(
  async (req, res) => {
    const id = req.params.id;
    const groupId = req.body.groupId;
    const permissions = req.body.permissions;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();    
    }
    const object = await objectCtrl.assignPermissionsToGroup(id, groupId, permissions);
    if(object){
      res.json(object);
    } else {
      res.status(400).send('Object not changed');
    }
  }
));

/* PATCH Remove an user from  UsersAuth permissions for an object. */
router.patch('/:id/removeUser',asyncHandler(
  async (req, res) => {
    const id = req.params.id;
    const userId = req.body.userId;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();    
    }
    const object = await objectCtrl.removeUser(id, userId);
    if(object){
      res.json(object);
    } else {
      res.status(400).send('Object not changed');
    }
  }
));

/* PATCH Remove a group from  GroupsAuth permissions for an object. */
router.patch('/:id/removeGroup',asyncHandler(
  async (req, res) => {
    const id = req.params.id;
    const groupId = req.body.groupId;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();    
    }
    const object = await objectCtrl.removeGroup(id, groupId);
    if(object){
      res.json(object);
    } else {
      res.status(400).send('Object not changed');
    }
  }
));

module.exports = router;