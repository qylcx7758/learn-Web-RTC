'use strict';

// import { Socket } from "net";

var isChannelReady=false;
var isInitiator=false;
var isStarted=false;
var localStream,pc,remoteStream,turnReady;

var pcConfig={
    'iceServers':[{
        'urls':'stun: stun.l.google.com:19302'
    }]
};


var sdpConstraints={
    offerToReceiveAudio:true,
    offerToReceiverVideo:true
}

var room='foo';

var socket=io.connect();

if(room!==""){
    socket.emit('create or join',room);
    console.log('attempted to create or join room',room)
}

socket.on('created',function(room){
    console.log('created room '+room);
    isInitiator=true;
})

socket.on('full',function(room){
    console.log('room '+ room +' is full');
})

socket.on('join',function(room){
    console.log('another peer made a request to join room '+room);
    console.log('this peer is the initiator of room '+ room +'!');
    isChannelReady=true;
})



socket.on('joined',function(room){
    console.log('joined:  '+room);
    isChannelReady=true;
})

socket.on('log',function(array){
    console.log.apply(console,array);
})



// //////////////////////////////////////////


function sendMessage(message){
    console.log('client sending message: ',message);
    socket.emit('message',message);
}

socket.on('message',function(message){
    console.log('client received message: ',message);
    if(message === 'got user media'){
        maybeStart();
    }else if(message.type==='offer'){
        if(!isInitiator && !isStarted){
            maybeStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
    }else if(message.type === 'answer' && isStarted){
        pc.setRemoteDescription(new RTCSessionDescription(message));
    }else if(message.type==='candidate' && isStarted){
        var candidate=new RTCIceCandidate({
            sdpMLineIndex:message.label,
            candidate:message.candidate
        })
        pc.addIceCandidate(candidate);
    }else if(message === 'bye' && isStarted){
        handleRemoteHangup();
    }
})


// ///////////////////////////////////
var localVideo=document.querySelector('#localVideo');
var remoteVideo=document.querySelector('#remoteVideo');


navigator.mediaDevices.getUserMedia({
    audio:false,
    video:true
})
.then(gotStream)
.catch(function(e){
    alert('getUserMedia() error '+e.name );
})

function gotStream(stream){
    console.log('adding local stream.');

    localStream=stream;
    localVideo.srcObject=stream;
    sendMessage('got user media');
    if(isInitiator){
        maybeStart()
    }
}

var constraints={
    video:true
}

console.log('getting user media with constraints ',constraints);

if(location.hostname !== 'localhost'){
    requestTurn(
        'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
    )
}

function maybeStart(){
    console.log('>>>> maybeStart() ',isStarted,localStream,isChannelReady );
    if(!isStarted && typeof localStream !== "undefined" && isChannelReady){
        console.log('>>>>> creating peer connection');
        createPeerConnection();
        pc.addStream(localStream);
        isStarted=true;
        console.log('isInitiator',isInitiator);
        if(isInitiator){
            doCall();
        }
    }
}



window.onbeforeunload=function(){
    sendMessage('bye')
}

/////////////////////////////////
function createPeerConnection(){
    try{
        pc=new RTCPeerConnection(null);
        pc.onicecandidate=handleIceCandidate;
        pc.onaddstream=handleRemoteStreamAdded;
        pc.onremovestream=handleRemoteStreamRemoved;
        console.log('created rtcpeerconnection');
    }catch(e){
        console.log('failed to create peerconnection, exception: '+e.message);
        alert('cannot create rtcpeerconnection object.')
        return;
    }
}


function handleIceCandidate(event){
    console.log('icecandidate event : ',event);
    if(event.candidate){
        sendMessage({
            type:'candidate',
            label:event.candidate.sdpMLineIndex,
            id:event.candidate.sdpMid,
            candidate:event.candidate.candidate
        });
    }else{
        console.log('end of candidates.')
    }
}



function handleCreateOfferError(event){
    console.log('createOffer()  error: ',event)
}


function doCall(){
    console.log('sending offer to peer')
    pc.createOffer(setLocalAndSendMessage,handleCreateOfferError);
}


function doAnswer(){
    console.log('sending answer to peer.')
    pc.createAnswer().then(
        setLocalAndSendMessage,
        onCreateSessionDescriptionError
    )
}


function setLocalAndSendMessage(sessionDescription){
    pc.setLocalDescription(sessionDescription);
    console.log('setLocalAndSendMessage sending message',sessionDescription);
    sendMessage(sessionDescription)
}


function onCreateSessionDescriptionError(error){
    trace('failed to create session description: '+error.toString());
}


function requestTurn(turnURL){
    var turnExists=false;
    for(var i in pcConfig.iceServers){
        if(pcConfig.iceServers[i].urls.substr(0,5)==='turn:'){
            turnExists=true;
            turnReady=true;
            break;
        }
    }

    if(!turnExists){
        console.log('getting TURN server from ',turnURL);
        var xhr=new XMLHttpRequest();
        xhr.onreadystatechange=function(){
            if(xhr.readyState === 4 && xhr.status === 200){
                var turnServer=JSON.parse(xhr.responseText);
                console.log('Got Turn server: ',turnServer);
                pcConfig.iceServers.push({
                    'urls':'turn:'+turnServer.username + "@" +turnServer.turn,
                    'credential':turnServer.password
                })
                turnReady=true;
            }
        };
        xhr.open('GET',turnURL,true);
        xhr.send();
    }

}


function handleRemoteStreamAdded(event){
    console.log('Remote stream added.');
    remoteStream=event.stream;
    remoteVideo.srcObject=remoteStream;
    console.log(remoteVideo.srcObject)
}

function handleRemoteStreamRemoved(event){
    console.log('remote stream removed.Event: ',event)
}

function hangup(){
    console.log('hanging up.');
    stop();
    sendMessage('bye');
}


function handleRemoteHangup(){
    console.log('session terminated.');
    stop();
    isInitiator =false;
}


function stop(){
    isStarted=false;
    pc.close();
    pc=null;
}