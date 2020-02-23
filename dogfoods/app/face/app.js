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
    // reduced the size by half for pen and performance.
    canvas.width = (this.width / 2);
    canvas.height = (this.height / 2);
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
    window["reddahApi"].qqMusk(vl,base64Image).then(data=>{
//alert(JSON.stringify(data))
if(data.Success==0){
    let qqmsg = JSON.parse(data.Message);
//alert(qqmsg .ret)
     if(qqmsg .ret===0){
         getBase64Image(qqmsg .data.image);
     }
     else{
        alert('error1:'+JSON.stringify(data))
     }
}
else{
    alert('error2:'+JSON.stringify(data))
}
        

        
    })
}

function getBase64Image(data){
//alert(data)
                //var dimg=document.getElementById("dest-img");
//alert(dimg)
                //dimg.src="data:image/jpeg;base64,"+data;
                //dimg.width=img.width;
                //dimg.height=img.height;

window["reddahApi"].viewImage("data:image/jpeg;base64,"+data);
            };

window["reddahApi"].loadCompleted()