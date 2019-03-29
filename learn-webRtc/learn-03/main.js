'use strict';

var localConnection, remoteConnection, sendChannel, receiveChannel, pcConstraint,dataConstraint;

var dataChannelSend = document.querySelector('textarea#dataChannelSend');
var dataChannelReceive = document.querySelector('textarea#dataChannelReceive');
var startButton = document.querySelector('button#startButton');
var sendButton = document.querySelector('button#sendButton');
var closeButton = document.querySelector('button#closeButton');

startButton.onclick = createConnection;
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;

function enableStartButton() {
    startButton.disabled = false;
}

function disabledSendButton() {
    sendButton.disabled = true;
}

function createConnection() {
    dataChannelSend.placeholder = "";
    var servers = null;
    pcConstraint = null;
    dataConstraint = null;
    zz('using sctp based data channels');

    window.localConnection = localConnection = new RTCPeerConnection(servers, pcConstraint);
    zz('Created local peer connection object local Connection');

    sendChannel = localConnection.createDataChannel('sendDataChannel', dataConstraint);
    zz('Created send data channel');


    localConnection.onicecandidate = iceCallback1;
    sendChannel.onopen = onSendChannelStateChange;
    sendChannel.onclose = onSendChannelStateChange;

    window.remoteConnection = remoteConnection = new RTCPeerConnection(servers, pcConstraint);

    zz('Created remote peer connection object remoteConnection');

    remoteConnection.onicecandidate = iceCallback2;
    remoteConnection.ondatachannel = receiveChannelCallback;

    localConnection.createOffer().then(gotDescription1, onCreateSessionDescriptionError);

    startButton.disabled = true;
    closeButton.disabled = false;
}

function onCreateSessionDescriptionError(error) {
    zz('falier to creatr session description : ' + error.toString());
}

function sendData() {
    var data = dataChannelSend.value;
    sendChannel.send(data);
    zz('send Data :' + data);
}

function closeDataChannels() {
    zz('close data channels');
    sendChannel.close();

    zz('clossed data channel with label :' + sendChannel.label);
    receiveChannel.close();
    zz('closed data channel with label :' + receiveChannel.label);

    localConnection.close();
    remoteConnection.close();
    localConnection = null;
    remoteConnection = null;

    zz('closed peer connections');

    startButton.disabled = false;
    sendButton.disabled = true;
    closeButton.disabled = true;
    dataChannelSend.value = '';
    dataChannelReceive.value = '';
    dataChannelSend.disabled = true;

    disabledSendButton();
    enableStartButton();
}


function gotDescription1(desc) {
    localConnection.setLocalDescription(desc);
    zz('Offer from localConnection \n' + desc.sdp);
    remoteConnection.setRemoteDescription(desc);
    remoteConnection.createAnswer().then(
        gotDescription2,
        onCreateSessionDescriptionError
    )
}


function gotDescription2(desc) {
    remoteConnection.setLocalDescription(desc);
    zz('Offer from localConnection \n' + desc.sdp);
    localConnection.setRemoteDescription(desc);
}



function iceCallback1(event) {
    zz('local ice callback');
    if (event.candidate) {
        remoteConnection.addIceCandidate(event.candidate)
            .then(onAddIceCandidateSuccess, onAddIceCandidateError)
        zz('local Ice candidate : \n' + event.candidate.candidate);
    };
   
}


function iceCallback2(event) {
    zz('remote ice callback');
    if (event.candidate) {
        localConnection.addIceCandidate(event.candidate)
            .then(onAddIceCandidateSuccess, onAddIceCandidateError);
        zz('remote Ice candidate: \n' + event.candidate.candidate)
    };

}


function onAddIceCandidateSuccess(){
    zz('AddIceCandidate success.');
}

function onAddIceCandidateError(){
    zz('failed to add ICE candidate: '+error.toString());
}

function receiveChannelCallback(event){
    zz('receive channel callback');
    receiveChannel=event.channel;
    receiveChannel.onmessage=onReceiveMessageCallback;
    receiveChannel.onopen=onReceiveChannelStateChange;
    receiveChannel.onclose=onReceiveChannelStateChange;

}

function onReceiveMessageCallback(event){
    zz('received message');
    dataChannelReceive.value=event.data;
}

function onSendChannelStateChange(){
    var readyState=sendChannel.readyState;
    zz('send channel state is :'+readyState);
    if(readyState === 'open'){
        dataChannelSend.disabled=false;
        dataChannelSend.focus();
        sendButton.disabled=false;
        closeButton.disabled=false;
    }else{
        dataChannelSend.disabled=true;
        sendButton.disabled=true;
        closeButton.disabled=true;
    }
}


function onReceiveChannelStateChange(){
    var readyState=receiveChannel.readyState;
    zz('receive channel state is :'+ readyState);
}









function zz(text) {
    text = text.trim();
    console.log(window.performance.now())
    const now = (window.performance.now() / 1000).toFixed(3);
    console.log(text)
}