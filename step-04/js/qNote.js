var noteObj={
    showNotePad:true,
    showPerfomanceTime:true,
    //
    // showLog:true
};


noteObj.toggleText=function(){
    var notePad=document.getElementById("notePad");
    if(notePad){
        if(notePad.style.display == "none"){
            notePad.style.display="block";
            this.innerText="hide";
        }else{
            notePad.style.display="none";
            this.innerText="show";
        }
    }
}

noteObj.setNote=function(){
    var notePad=document.getElementById("notePad");
    if(notePad){
        // notePad.setAttribute("rows",15);
    //   set cssText berfore setting the single style
        notePad.style.cssText="box-sizing:border-box;width:80%;height:40%;border:1px solid #ccc;padding:10px;opactiy:0.7;position:fixed;bottom:0;left:0;z-index:9999;display:none";
        notePad.style.width=document.getElementsByTagName("body")[0].offsetWidth+"px";
    }
}

noteObj.setBtn=function(){
    var noteBtn=document.getElementById("noteBtn");
    if(noteBtn){
        noteBtn.innerText="show";
        noteBtn.onclick=noteObj.toggleText;
        noteBtn.style.cssText="box-sizing:border-box;opacity:0.4;position:fixed;top:30%;right:30px;cursor:pointer;padding:10px;z-index:9999";
    }
}



noteObj.createEle=function(){

  
    var noteBtn=document.createElement("button");
    var notePad=document.createElement("textArea");
    var bodyEle=document.getElementsByTagName("body")[0];
    // zz( "00","rr")
    // zz(noteBtn)
    noteBtn.setAttribute("id","noteBtn");
    notePad.setAttribute("id","notePad");
    bodyEle.appendChild(noteBtn);
    bodyEle.appendChild(notePad);
    // zz(bodyEle,60)
    noteObj.setBtn();
    noteObj.setNote();
}

noteObj.noteMsg=function(){
    console.warn(...arguments)
    var notePad=document.getElementById("notePad");
    if(notePad && arguments.length>0){
        var time=noteObj.showPerfomanceTime?(window.performance.now()/1000).toFixed(3)+"s >>>> ":"";
        notePad.innerHTML+=time;
        for(var i=0;i<arguments.length;i++){
            // notePad.innerHTML+="<li>"+arguments[i]+"</li>";
            var msg;
            if(typeof(arguments[i])=="object"){
                msg=JSON.stringify(arguments[i]);
                if(msg=='{}'){
                    msg=arguments[i];
                }
            }else if(typeof(arguments[i])=="number"){
                msg=arguments[i].toString().trim();
            }else{
                msg=arguments[i].trim();          
            }
            notePad.innerHTML+=msg+"&nbsp&nbsp";
        }
        notePad.innerHTML+"\n"
    }
}



noteObj.init=function(){
    if(noteObj.showNotePad){
        console.log=noteObj.noteMsg;
    }
    // if(noteObj.showLog){
   
    // }
    noteObj.createEle(); 
}


function zz(){
    var time=noteObj.showPerfomanceTime?(window.performance.now()/1000).toFixed(3)+"s >>>> ":"";
    var arr=[];
    // arguments 数组的unshift方法
    // arguments.push(33)
    arr.push.apply(1,arguments)
    // arguments.unshift.apply(arr,time)
    // arguments.unshift(time)
    console.log(time,...arguments)
    // if(arguments.length==1){
    //     var msg;
    //     if(typeof(arguments[0])=="number"){
    //         msg=arguments[0].toString().trim();
    //         console.log(time+msg);
    //     }else if(typeof(arguments[0])=="string"){
    //         msg=arguments[0].trim();    
    //         console.log(time+msg);      
    //     }else{
    //         console.log(arguments[0])
    //     }
   
    // }else if(arguments.length>1){
    //     console.log(...arguments)
    // }
}