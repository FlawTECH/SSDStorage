// config should be imported before importing any other file
const config = require('./config/config');
const app = require('./config/express');
const router = require('./routes/index.route')
var server = require('http').Server(app);
var sio = require('socket.io');
require('./config/mongoose');

var io;
module.exports.getio = function(){
  if(io===undefined){
    io = new sio(server);
    io.on('connection', function (socket) {
      socket.emit('message', "coucouzz");
    });
  }
  return io;
}



// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  server.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`);
    this.getio();
  });
}

module.exports = {server};