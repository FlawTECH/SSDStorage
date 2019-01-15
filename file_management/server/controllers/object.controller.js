const Object = require('../models/object.model');
const {mongoose} = require('../db/mongoose');
const {ObjectID} = require('mongodb');
const fs = require('fs-extra');
const efs = require('extfs');
const _ = require('lodash');


async function query() {
  return await Object.find().then((objects)=>{
      console.log(objects);
      return objects;
  }).catch((e)=>{
      console.log(e);
      return e;
  });
}

async function queryById(id) {
    return await Object.find({
        _id: id
    }).then((object)=>{
        return object;
    }).catch((e)=>{
        console.log(e);
        return e;
    });
}

async function updateName(id, newname){

    const original = await this.queryById(id);
    if(original){
        const path = original[0].path.trim();
        const name = original[0].name.trim();
        const fullpath =  path + name; 
        try{
            console.log(fullpath);
            if (fs.statSync(fullpath).isFile()) {
                try{
                    fs.renameSync(fullpath, path + newname.trim());
                    return await Object.findOneAndUpdate({
                        _id: id
                    },{
                        $set: {name: newname}
                    },{
                        new: true
                    }).then((object)=>{
                        if(!object) {
                            return null;
                        }
                        return object;
                    }).catch((e)=>{
                        console.log(e);
                        return e;
                    });
                }catch(e){
                    console.log(e);
                    return false;
                }
            }
        }catch(e){
            console.log(e);
            return false;
        }
    }
}

async function updatePath(id, newpath){

    const original = await this.queryById(id);
    if(original){
        const path = original[0].path.trim();
        const name = original[0].name.trim();
        const fullpath =  path + name; 

        if(fs.pathExistsSync(newpath)){
            fs.moveSync(fullpath, newpath.trim()+name);
            return await Object.findOneAndUpdate({
                _id: id
            },{
                $set: {path: newpath}
            },{
                new: true
            }).then((object)=>{
                if(!object) {
                    return null;
                }
                return object;
            }).catch((e)=>{
                console.log(e);
                return e;
            });
        } else {
            console.log(err);
            return false;
        }
    }
}

async function deleteById(id){
    const original = await this.queryById(id);
    if(original){
        const path = original[0].path.trim();
        const name = original[0].name.trim();
        const type = original[0].type.trim();
        const fullpath =  path + name; 
        let validated = false;
        console.log(fullpath);
        if(type==="D"){
            console.log("Tratando de eliminar un DIR");
            if(fs.existsSync(fullpath)){
                console.log("El directorio existe");
                const empty = efs.isEmptySync(fullpath);
                console.log(empty);
                if(empty){
                    validated = true;
                }else{
                    console.log("El directorio no esta vacio");
                }
            }
        } else if (type==="F") {
            console.log("Tratando de eliminar un FILE");
            if (fs.statSync(fullpath).isFile()) {
                validated = true;
            }
        }
        if(validated){
            try{
                fs.removeSync(fullpath);
                return await Object.findOneAndRemove({
                    _id: id
                }).then((object)=>{
                    if(!object) {
                        return null;
                    }
                    return object;
                }).catch((e)=>{
                    console.log(e);
                    return e;
                });                    
            }catch(e){
                console.log(e);
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
    
    
}

async function assignUser(id, userId) {
    var userToBeAssigned = {};
    userToBeAssigned.userId = ObjectID(userId);
    userToBeAssigned.permissions = [];

    return await Object.findOne({
        _id: id,
    }).then(async (object)=>{
        if(!object) {
            return null;
        }
        let exists = false;
        object.usersAuth.forEach(element => {
            if(element.userId.equals(userId)){
                exists = true;
            }
        });
        if(!exists){
            object.usersAuth.push(userToBeAssigned);
            return await Object.findOneAndUpdate({                       
                _id: id
            },{
                $set: {usersAuth: object.usersAuth}
            },{
                new: true
            }).then((object)=>{
                if(!object) {
                    return null;
                }
                return object;
            }).catch((e)=>{
                console.log(e);
                return e;
            });
        }
        return object;
    }).catch((e)=>{
        console.log(e);
        return e;
    });
}

async function assignPermissionsToUser(id, userId, permissions) {

    return await Object.findOne({
        _id: id,
    }).then(async (object)=>{
        if(!object) {
            return null;
        }
        let exists = false;
        object.usersAuth.forEach(element => {
            if(element.userId.equals(userId)){
                exists = true;
                element.permissions = permissions;
            }
        });
        if(exists){
            return await Object.findOneAndUpdate({                       
                _id: id
            },{
                $set: {usersAuth: object.usersAuth}
            },{
                new: true
            }).then((object)=>{
                if(!object) {
                    return null;
                }
                return object;
            }).catch((e)=>{
                console.log(e);
                return e;
            });
        }
        return object;
    }).catch((e)=>{
        console.log(e);
        return e;
    });
}

async function removeUser(id, userId) {
    return await Object.findOne({
        _id: id,
    }).then(async (object)=>{
        if(!object) {
            return null;
        }
        object.usersAuth = _.remove(
            object.usersAuth,
            function(elem) {
                return elem.userId != userId
            }
        )
        console.log(object.usersAuth)
        return await Object.findOneAndUpdate({                       
            _id: id
        },{
            $set: {usersAuth: object.usersAuth}
        },{
            new: true
        }).then((object)=>{
            if(!object) {
                return null;
            }
            return object;
        }).catch((e)=>{
            console.log(e);
            return e;
        });
    }).catch((e)=>{
        console.log(e);
        return e;
    });
}

async function assignGroup(id, groupId) {
    var groupToBeAssigned = {};
    groupToBeAssigned.groupId = ObjectID(groupId);
    groupToBeAssigned.permissions = [];

    return await Object.findOne({
        _id: id,
    }).then(async (object)=>{
        if(!object) {
            return null;
        }
        let exists = false;
        object.groupsAuth.forEach(element => {
            if(element.groupId.equals(groupId)){
                exists = true;
            }
        });
        if(!exists){
            object.groupsAuth.push(groupToBeAssigned);
            return await Object.findOneAndUpdate({                       
                _id: id
            },{
                $set: {groupsAuth: object.groupsAuth}
            },{
                new: true
            }).then((object)=>{
                if(!object) {
                    return null;
                }
                return object;
            }).catch((e)=>{
                console.log(e);
                return e;
            });
        }
        return object;
    }).catch((e)=>{
        console.log(e);
        return e;
    });
}

async function assignPermissionsToGroup(id, groupId, permissions) {

    return await Object.findOne({
        _id: id,
    }).then(async (object)=>{
        if(!object) {
            return null;
        }
        let exists = false;
        object.groupsAuth.forEach(element => {
            if(element.groupId.equals(groupId)){
                exists = true;
                element.permissions = permissions;
            }
        });
        if(exists){
            return await Object.findOneAndUpdate({                       
                _id: id
            },{
                $set: {groupsAuth: object.groupsAuth}
            },{
                new: true
            }).then((object)=>{
                if(!object) {
                    return null;
                }
                return object;
            }).catch((e)=>{
                console.log(e);
                return e;
            });
        }
        return object;
    }).catch((e)=>{
        console.log(e);
        return e;
    });
}

async function removeGroup(id, groupId) {
    return await Object.findOne({
        _id: id,
    }).then(async (object)=>{
        if(!object) {
            return null;
        }
        object.groupsAuth = _.remove(
            object.groupsAuth,
            function(elem) {
                return elem.groupId != groupId
            }
        )
        return await Object.findOneAndUpdate({                       
            _id: id
        },{
            $set: {groupsAuth: object.groupsAuth}
        },{
            new: true
        }).then((object)=>{
            if(!object) {
                return null;
            }
            return object;
        }).catch((e)=>{
            console.log(e);
            return e;
        });
    }).catch((e)=>{
        console.log(e);
        return e;
    });
}

module.exports = {
    query,
    queryById,
    updateName,
    updatePath,
    deleteById,
    assignUser,
    assignPermissionsToUser,
    assignGroup,
    assignPermissionsToGroup,
    removeUser,
    removeGroup
};
