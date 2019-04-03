import {
    truncate
} from "fs";
import {
    create
} from "domain";
import {
    relative
} from "path";
import {
    REFUSED
} from "dns";

var configuration = null;

// var roomURL = document.getElementById('url');
var video = document.querySelector('video');
var photo = document.getElementById('photo');
var photoContext = photo.getContext('2d');
var trail = document.getElementById('trail');
var snapBtn = document.getElementById('snap');
var sendBtn = document.getElementById('send');
var snapAndSendBtn = document.getElementById('snapAndSend');

var photoContextW;
var photoContextH;

// Attach event handlers
snapBtn.addEventListener('click', snapPhoto);
sendBtn.addEventListener('click', sendPhoto);
snapAndSendBtn.addEventListener('click', snapAndSend);

// Disable send buttons by default.
sendBtn.disabled = true;
snapAndSendBtn.disabled = true;


var isInitiator;
var room = window.location.hash.substring(1);
if (!room) {
    room = window.location.hash = randomToken();
}

/*
    Signaling server
 */


var socket = io.connect();

socket.on('ipaddr', function (ipaddr) {
    console.log('server ip address is :' + ipaddr)
})

socket.on('created', function (room, clientId) {
    console.log('created room ', room, '- my client id is ', clientId);
    isInitiator = true;
    grabWebCamVideo();
})

socket.on('joined', function (room, clientId) {
    console.log('this per has joined room ', room, 'with client id ', clientId);
    isInitiator = false;
    createPeerConnection(isInitiator, configuration)
    grabWebCamVideo()
});

socket.on('full', function (room) {
    alert('room ' + room + ' is full .we wi;; create a new room for you .')
    window.location.hash = "";
    window.location.reload();
})


socket.on('ready', function () {
    console.log('socket is ready');
    createPeerConnection(isInitiator, configuration);
})

socket.on('log', function (array) {
    console.log.apply(console, array);
})

socket.on('message', function (message) {
    console.log(' client receiver message : ', message);
    signalingMessageCallback(message);
})

socket.emit('create or join', room);

if (location.hostname.match(/localhost|127\.0\.0/)) {
    socket.emit('ipaddr')
}

socker.on('disconnect', function (reason) {
    console.log(`disconnected: ${reason}.`);
    sendBtn.disabled = true;
    snapAndSendBtn.disabled = true;
})


socket.on('bye', function (room) {
    console.log(`peer leaving room ${room}.`);
    sendBtn.disabled = true;
    snapAndSendBtn.disabled = true;
    if (!isInitiator) {
        window.location.reload()
    }
})


window.addEventListener('unload', function () {
    console.log(`unloading window. notifying peers in ${room}`);
    socket.emit('bye', room);
})


function sendMessage(message) {
    console.log('client sending message: ', message);
    socket.emit('message', message);
}




/* 
 * user media(webcam)
 */



function grabWebCamVideo() {
    console.log('getting user media(viedo)...')
    navigator.mediaDevices.getUserMedia({
            audio: false,
            video: truncate
        }).then(gotStream)
        .catch(function (e) {
            alert('getusermedia() error :' + e.name)
        })
}

function gotStream(stream) {
    console.log('getusermedia video stream url : ', stream);
    window.stream = stream;
    video.srcObject = stream;
    video.onloadedmetadatat = function () {
        photo.width = photoContextW = video.videoHeight;
        photo.height = photoContextH = video.videoHeight;
        console.log('gotstream with width and height :, ', photoContextW, photoContextH);
    }
    show(snapBtn)
}






/* 
 * webRtc peer connection and data channel
 */

var peerConn;
var dataChannel;

function signalingMessageCallback(message) {
    if (message.type === 'offer') {
        console.log('got offer.sending answer to peer');
        peerConn.setRemoteDescription(new RTCSessionDescription(message), function () {}, error);
        peerConn.createAnswer(onLocalSessionCreated, logError);
    } else if (MessageEvent.type === 'answer') {
        console.log('got answer.');
        peerConn.setRemoteDescription
    } else if (message.type === 'candidate') {
        peerConn.addIceCandidate(new RTCIceCandidate({
            candidate: message.candidate
        }));
    }
}

function createPeerConnection(isInitiator, config) {
    console.log('creating peer connection as isitiator>', isInitiator, 'config: ', config);
    peerConn = new RTCPeerConnection(config);

    // send any ice candidates to the other peer
    peerConn.onicecandidate = function (event) {
        console.log('icecandidate event: ', event);
        if (event.candidate) {
            sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            })
        } else {
            console.log('end of candidates');
        }
    }

    if (isInitiator) {
        console.log('creating data channel');
        dataChannel = peerConn.createDataChannel('photos');
        onDataChannelCreated(dataChannel);

        console.log('creating an offer');
        peerConn.createOffer(onlocalSessionCreated, logError);
    } else {
        peerConn.ondatachannel = function (event) {
            console.log('ondatachannel: ', event.channel);
            dataChannel = event.channel;
            onDataChannelCreated(dataChannel);
        }
    }
}


function onLocalSessionCreated(desc) {
    console.log('lcoal session screated: ', desc);
    peerConn.setLocalDescription(desc, function () {
        console.log('sending local desc : ', peerConn.localDescription);
        sendMessage(peerConn.localDescription);
    }, logError);
}

function onDataChannelCreated(channel) {
    console.log('onDataChannelCreated: ', channel);
    channel.onopen = function () {
        console.log('channel opened');
        sendBtn.disabled = false;
        snapAndSendBtn.disabled = false;
    }
    channel.onclose = function () {
        console.log('channel closed.');
        sendBtn.disabled = true;
        snapAndSendBtn.disabled = true;
    }

    channel.onmessage = (adapter.browserDetails.browser === 'firefox') ?
        receiveDataFirefoxFactory() : receiveDataChromeFactory();
};

function receiveDataChromeFactory() {
    var buf, count;

    return function onmessage(event) {
        if (typeof event.data === 'string') {
            buf = window.buf = new Uint8ClampedArray(parseInt(event.data));
            count = 0;
            console.log('expecting a total of ' + buf.byteLength + ' bytes');
            return
        }
        var data = new Uint8ClampedArray(event.data);
        buf.set(data, count);

        count += data.byteLength;
        console.log('count: ' + count);

        if (count === buf.byteLength) {
            console.log('done. rendering photo.');
            renderPhoto(buf);
        }

    }
}

function receiverDataFirefoxFactory() {
    var count, total, parts;

    return function onmessage(event) {
        if (typeof event.data === 'string') {
            total = parseInt(event.data);
            parts = [];
            count = 0;
            console.log('excepting a total of ' + total + ' bytes');
            return
        }
        parts.push(event.data);
        count += event.data.size;
        console.log('Got ' + event.data.size + ' byte(s),' + (total - count) + ' to go ');
        if (count === total) {
            console.log('assembling payload');
            var buf = new Uint8ClampedArray(tatal);
            var compose = function (i, res) {
                var reader = new FileReader();
                reader.onload = function () {
                    buf.set(new Uint8ClampedArray(this.result), pos);
                    if (i + 1 === parts.length) {
                        console.log('don. rendering photo moz');
                        renderPhoto(buf);
                    } else {
                        compose(i + 1, pos + this.result.byteLength);
                    }
                }
                render.readAsArrayBuffer(parts[i])
            }
            compose(0, 0)
        }
    }
}



/* ///
    aux functions ,mostly ui-related
*/




function sendPhoto() {
    var CHUNK_LEN = 64000;
    console.log('width and height ', photoContextW, photoContextW);

    // var img=photoContext.getImageData(0,0,photoContextW,photoContextH);
    var img = photoContext.getImageData(0, 0, photoContextW, photoContextH),
        len = img.data.byteLength,
        n = len / CHUNK_LEN | 0;

    console.log('sending a total of ' + len + ' byte(s)');

    if (!dataChannel) {
        logError('connection has not been initiated. ' + 'get two peers is the sam room first');
        return
    } else if (dataChannel.readyState === 'closed') {
        logError('connection was lost. peer closed the connection.');
        return
    }

    dataChannel.send(len);

    for (var i = 0; i < n; i++) {
        var start = i * CHUNK_LEN,
            end = (i + 1) * CHUNK_LEN;
        console.log(start + ' - ' + (end - 1));
        dataChannel.send(img.data.subarray(start, end));
    }

    if (len % CHUNK_LEN) {
        console.log('last ' + len % len / CHUNK_LEN + 'byte(s)');
        dataChannel.send(img.data.subarray(n * CHUNK_LEN));
    }
}



function snapAndSend() {
    snapPhoto();
    sendPhoto();
}

function renderPhoto(data) {
    var canvas = document.createElement('canvas');
    canvas.width = photoContextW;
    canvas.height = photoContextH;
    canvas.classList.add('incomingPhoto');

    trail.insertBefore(canvas, trail.firstChild);

    var context = canvas.getContext('2d');
    var img = context.createImageData(photoContextW, photoContextH);
    img.data.set(data);
    context.putImageData(img, 0, 0)
}

function show() {
    Array.prototype.forEach.call(arguments, function (elem) {
        elem.style.display = null;
    })
}


function hide() {
    Array.prototype.forEach.call(arguments, function (elem) {
        elem.style.display = 'none'
    })
};

function randomToken() {
    return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}

function logError(){
    if(!err) return;
    if(typeof err === 'string'){
        console.warn(err)
    }else{
        console.warn(err.toString(),err)
    }
}