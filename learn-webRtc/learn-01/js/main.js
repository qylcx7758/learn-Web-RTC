const ovideo=document.getElementById("ovideo");
let localStream;
const mediaStreamConstraints={
    // audio:true,
    // video:true
    video:{
        width:1280,
        innerHeight:720
    }
};
function getLocalMediaStream(mediaStream){
    console.log(mediaStream)
    localStream=mediaStream;
    // console.log(ovideo.videoWidth,ovideo.videoHeight)
    if(ovideo){
     
        ovideo.srcObject=mediaStream;
        console.log(ovideo.srcObject)
        console.log(ovideo)
        // console.log(ovideo.videoWidth,ovideo.videoHeight)

    }
};

if(ovideo){

    ovideo.addEventListener("canplay",function(e){
        console.log(e)
        console.log(this)
        // 播放后获取实际的视频源的宽高
        console.log(this.videoWidth,this.videoHeight)
    })
}
function handleLocalMediaStreamEroor(error){
    
    console.log("navigator.getUserMedia error:  ",error);
}

navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then(getLocalMediaStream).catch(handleLocalMediaStreamEroor);