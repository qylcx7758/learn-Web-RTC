`use strict`;

const mediaStreamConstraints={
    video:true
};

const offerOptions={
    offerToReceiveVideo:1
}

let startTime=null;

const LocalVideo=document.getElementById("localVideo");
const remoteVideo=document.getElementById("remoteVideo");

const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');

callButton.disabled = true;
hangupButton.disabled = true;


let localStream,remoteStream,localPeerConnection;

function gotLocalMediaStream(mediaStream){
    LocalVideo.srcObject=mediaStream;
    localStream=mediaStream;
    zz('receive local stream');
    callButton.disabled=false;
}

function handleLocalMediaStreamError(error){
    zz(`navigator.getUserMedia  error : ${error.toString()}` )
}


function gotRemoteMediaStream(event){
    const mediaStream=event.stream;
    remoteVideo.srcObject=mediaStream;
    remoteStream=mediaStream;
}


function logVideoLoaded(event){
    const video=event.target;
    zz(`${video.id}    videoWidth:  ${video.videoWidth}px,`+ `videoHeight: ${video.videoHeight}px.`);
}



function logResizeVideo(event){
    logVideoLoaded(event);
    if(startTime){
        const elapsedTime=window.performance.now() -startTime;
        startTime=null;
        zz(`Setup time: ${elapsedTime.toFixed(3)}ms. `)
    }
}

LocalVideo.addEventListener('loadedmetadata',logVideoLoaded);

remoteVideo.addEventListener('loadmetadata',logVideoLoaded);
remoteVideo.addEventListener('onresize',logResizeVideo);


function handleConnection(event){
    const peerConnection=event.targetl
    const iceCandidate=event.candidate;
    if(iceCandidate){
        const newIceCandidate=new RTCIceCandidate(iceCandidate);
        const otherPeer=getOtherPeer(peerConnection);
        otherPeer.addIceCandidate(newIceCandidate)
        .then(()=>{
            handleConnectionSuccess(peerConnection);
        }).catch((error)=>{
            handleConnectionFailure(peerConnection,error)
        })
    }
}

function handldConnecttionSuccess(peerConnection){
    zz(`${getPeerName(peerConnection)} addIceCandidate success`);
};

function handleConnectionFailure(peerConnection,error){
    console.log(error)
    zz(`${getPeerName(peerConnection)} failed to add ICE Candidate:\n`+`${error.toString()}.`);
}

function handleConnectionChange(event){
    const peerConnection=event.target;
    console.log('ICE statr change event: ',event);
    zz(`${getPeerName(peerConnection)} ICE state: `+
        `${peerConnection.iceConnectionState}.`);
}

function setSessionDescriptionError(error){
    zz(`Failed to create session description: ${error.toString()}`)
}

function setDescriptionSuccess(peerConnection,functionName){
    const peerName=getPeerName(peerConnection);
    zz(`${peerName} ${functionName} complete.`)
}

function setLocalDescriptionSuccess(peerConnection){
    setDescriptionSuccess(peerConnection,'setLocalDescription')
}

function setRemoteDescriptionSuccess(peerConnection){
    setDescriptionSuccess(peerConnection,'setRemoteDescription')
}

function createdOffer(description){
    zz(`offer from localPeerConnection: \n ${description.sdp}`);

    zz('localPeerConnection setLocalDescription start.');

    localPeerConnection.setLocalDescription(description)
        .then(()=>{
            setLocalDescriptionSuccess(localPeerConnection);
        }).catch(setSessionDescriptionError);

    zz('remotePeerConnection setRemoteDescription start.')

    remotePeerConnection.setRemoteDescription(description)
        .then(()=>{
            setRemoteDescriptionSuccess(remotePeerConnection);
        }).catch(setSessionDescriptionError)


    zz('remotePeerConnection createAnswer start.');
    remotePeerConnection.createAnswer()
        .then(createdAnswer)
        .catch(setSessionDescriptionError);

    

    // remotePeerConnection.creatrdAnswer

}

function createdAnswer(description){
    zz(`Answer from remotePeerConnection: \n${description.adp}.`);

    zz('remotePeerConnection setLocalDescription start.');
    remotePeerConnection.setLocalDescription(description)
        .then(()=>{
            setLocalDescriptionSuccess(remotePeerConnection);
        }).catch(setSessionDescriptionError);

    zz('localPeerConnection setRemoteDescription start.');
    
    localPeerConnection.setRemoteDescription(description)
        .then(()=>{
            setRemoteDescriptionSuccess(remotePeerConnection)
        }).catch(setSessionDescriptionError)

    zz('remotePeerConnection createAnswer start.');

    // remotePeerConnection.createAnswer()
    //     .then(ceratedAnswer)
    //     .catch(setSessionDescriptionError);
}


// about behavior to buttons
function startAction(){
    startButton.disabled=true;
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
        .then(gotLocalMediaStream).catch(handleLocalMediaStreamError);
    zz("requesting local stream")
}

function callAction(){
    callButton.disabled=true;
    hangupButton.disabled=false;

    zz('Starting call');
    startTime=window.performance.now();
    const videoTracks=localStream.getVideoTracks();
    const audioTracks=localStream.getAudioTracks();

    if(videoTracks.length>0){
        zz(`using video device: ${videoTracks[0].label}`)
    }
    if(audioTracks.length>0){
        zz(`using audio device: ${audioTracks[0].label}`)
    }




const servers=null;

localPeerConnection=new RTCPeerConnection(servers);
zz('creatd local peer connection object localPeerConnection.');

localPeerConnection.addEventListener('icecandidate',handleConnection);
localPeerConnection.addEventListener('iceconnectionstatechange',handleConnectionChange);

remotePeerConnection=new RTCPeerConnection(servers);
zz('created remote peer connection object remotePeerConnection.');

remotePeerConnection.addEventListener('icecandidate',handleConnection);
remotePeerConnection.addEventListener('iceconnectionstatechange',handleConnectionChange);
remotePeerConnection.addEventListener('addstream',gotRemoteMediaStream);

localPeerConnection.addStream(localStream);
zz('added local stream to localpeerConnection.')

zz('localPeerConnection createoffer start.')

localPeerConnection.createOffer(offerOptions)
    .then(createdOffer).catch(setSessionDescriptionError);
}

function hangupAction(){
    localPeerConnection.close();
    remotePeerConnection.close();
    localPeerConnection=null;
    remotePeerConnection=null;
    hangupButton.disabled=true;
    callButton.disabled=false;

    zz('ending call')
}

startButton.addEventListener('click',startAction);
callButton.addEventListener('click',callAction);
hangupButton.addEventListener('click',hangupAction);

function getOtherPeer(peerConnection){
    return (peerConnection === localPeerConnection)?remotePeerConnection:localPeerConnection;
}

function getPeerName(peerConnection){
    return (peerConnection === localPeerConnection)?'localPeerConnection':'remotePeerConnection';
}






function zz(text){
    text=text.trim();
    console.log(window.performance.now() )
    const now=(window.performance.now() /1000 ).toFixed(3);
    console.log(text)
}