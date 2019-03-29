'use strict';

var os=require('os');
var nodeStatic=require('node-static');
var http=require('http');
var socketIO=require('socket.io');

// console.log(socketIO)

// console.log(nodeStatic)
var fileServer=new(nodeStatic.Server)();
var app=http.createServer(function(req,res){
  // console.log(req)
  // console.log(res)

  fileServer.serve(req,res);
}).listen(8050);
console.log(' server listen 8050')
var io=socketIO.listen(app);
io.sockets.on('connection',function(socket){
  // debugger
  function log(){
    var array=['message from server:'];
    array.push.apply(array,arguments);
    console.log(arguments)
    socket.emit('log',array);
  }



socket.on('message',function(message){
  log('Client said:',message);
  socket.broadcast.emit('message',message);
});

socket.on('create or join',function(room) {
  log('received request to create or join room '+room);
  // console.log(io.sockets)
  // console.log(io.sockets.adapter)
  var clientsInRoom=io.sockets.adapter.rooms[room];
  console.log(clientsInRoom)
  var numClients=clientsInRoom?Object.keys(clientsInRoom.sockets).length:0;

  log('Room ' + room + ' now has '+numClients +' client(s)');

// socket.on('create or join', function(room) {
//   log('Received request to create or join room ' + room);

//   var clientsInRoom = io.sockets.adapter.rooms[room];
//   var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
//   log('Room ' + room + ' now has ' + numClients + ' client(s)');



  // console.log(socket)
  console.log(numClients)
  if(numClients === 0){
    socket.join(room);
    log('client id ' +socket.id + ' created room '+room );
    socket.emit('created ',room,socket.id)
  }else if(numClients === 1){
    log('client id '+socket.id + ' joined room '+room);
    io.sockets.in(room).emit('join',room);
    socket.join(room);
  }else{
    socket.emit('full',room)
  }

})
    socket.on('ipaddr',function() {
        var ifaces=os.networkInterfaces();
        console.log(ifaces)
        for(var dev in ifaces){
            ifaces[dev].forEach(function(details){
                if(details.family === 'IPV4' && details.address !=='127.0.0.1'){
                    socket.emit('ipaddr',details.address);
                }
            })
        }
    })

})