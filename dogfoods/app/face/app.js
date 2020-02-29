var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    img = new Image(),
    effectEl = document.getElementById("effect"),
    settings = {
        radius: 4,
        intensity: 25,
        ApplyFilter: function() {
            doOilPaintEffect();
        }
    }

img.addEventListener('load', function() {
    var originWidth = this.width;
    var originHeight = this.height;
    
    var maxWidth = 400, maxHeight = 400;
    
    var targetWidth = originWidth, targetHeight = originHeight;
    
    if (originWidth > maxWidth || originHeight > maxHeight) {
        if (originWidth / originHeight > maxWidth / maxHeight) {
            
            targetWidth = maxWidth;
            targetHeight = Math.round(maxWidth * (originHeight / originWidth));
        } else {
            targetHeight = maxHeight;
            targetWidth = Math.round(maxHeight * (originWidth / originHeight));
        }
    }
        
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
});

function chooseFromPhoto(){
    window["reddahApi"].album().then(data=>{
        img.src=data.replace("file://","http://localhost:8080/_app_file_");

        canvas.width = "90%"//(this.width / 2);
        canvas.height = "90%"//(this.height / 2);
        ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
    })
}

function chooseFromCamera(){
    window["reddahApi"].camera().then(data=>{
        img.src=data.replace("file://","http://localhost:8080/_app_file_");

        canvas.width = "90%"//(this.width / 2);
        canvas.height = "90%"//(this.height / 2);
        ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
    })
}

img.crossOrigin = "Anonymous";
img.src = "assets/500/musk.jpg";

vl=1;
function mt(v){
vl=v;
change();
}
function change(){
   let base64Image = canvas.toDataURL('image/jpeg');
    window["reddahApi"].loadingStart('bubbles',20000);
    window["reddahApi"].qqMusk(vl,base64Image).then(data=>{
//alert(JSON.stringify(data))
if(data.Success==0){
    let qqmsg = JSON.parse(data.Message);
//alert(qqmsg .ret)
     if(qqmsg .ret===0){
         getBase64Image(qqmsg.data.image);
     }
     else{
        let code = qqmsg.ret;
        if(code=29){
            window["reddahApi"].alert("系统繁忙","请稍后重试")
        }
        else{
            window["reddahApi"].alert("Error"+qqmsg.ret,qqmsg.msg)
        }  
    }
}
else{
    window["reddahApi"].alert("Error",JSON.stringify(data))
}
        

        
    })
}

function getBase64Image(data){
    window["reddahApi"].viewImage("data:image/jpeg;base64,"+data).then(data=>{
        window["reddahApi"].loadingStop();
    });
}

window["reddahApi"].loadCompleted()