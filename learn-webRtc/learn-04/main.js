'use strict';

var isInitiator;

window.room=prompt('enter room name:');
console.log(io)
var socket=io.connect();
console.log(socket)


if(room !== ''){
    console.log('message from clients:  asking to join room '+room);
    socket.emit('create or join',room);
}

socket.on('created',function(room,clientId){
    console.log(...arguments);
    isInitiator=true;
})


socket.on('full',function(room) {
    console.log('message from client : room '+ room + 'is full :^( ')
})

socket.on('ipaddr',function(ipaddr){
    console.log('message from client : server ip address is '+ ipaddr);
})

socket.on('joined',function() {
    isInitiator=false;
})

socket.on('log',function(array){
    console.log(array)
    console.log.apply(console,array);
})
