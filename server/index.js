// config should be imported before importing any other file
const config = require('./config/config');
const app = require('./config/express');
const router = require('./routes/index.route')
var server = require('http').Server(app);
var sio = require('socket.io');
require('./config/mongoose');
const fs = require('fs-extra');

fs.ensureDirSync(__dirname + "/../userDirectory");
fs.createFile(__dirname + "/../logs/logs.txt", function(err) {
})

var io;
module.exports.getio = function(){
  if(io===undefined){
    io = new sio(server);
    io.on('connection', function (socket) {
    });
  }
  return io;
}



// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  server.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`);
    fs.appendFile(__dirname + "/../logs/logs.txt",new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') +` : server started on port ${config.port} (${config.env})`, function(err) {
    })
    this.getio();
  });
}

module.exports = {server};