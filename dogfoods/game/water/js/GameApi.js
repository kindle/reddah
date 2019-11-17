function ShareToFacebook(NameID,Message)
{
	var openURL="https://www.yiv.com/"+NameID;
	var url="https://www.facebook.com/dialog/feed?app_id=836700136395273&display=popup&caption="+Message+"&link="+openURL+"&redirect_uri="+openURL+"&picture=https://www.yiv.com/thumb/"+NameID+".jpg";
	window.open(url)
}
function ShareToWebsites(platform,name,nameid,msg){
	switch(platform){
		case "facebook":ShareToFacebook(nameid,msg);break;
		case "twitter":ShareToTwitter(nameid,msg);break
	}
}
function ShareToTwitter(NameID,Message)
{
	var openURL="https://www.yiv.com/"+NameID;
	var url="https://twitter.com/share?text="+Message+"&url=https://www.yiv.com/"+NameID;
	window.open(url)
}
function CreateLinksInGame(NameID,Screen,Button)
{
	GameTag=typeof GameTag!=='undefined'?GameTag:"home";
	var domain=document.referrer;
	var url="https://www.yiv.com/";
	if(typeof domain==='undefined'||domain==""||domain=="undefined")
	{domain="yiv.com"}
	else{domain=domain.split('/')[2]}
if(Button.substring(0,4)=="app_"||Button=="gg"||Button=="ios"){url=url+"app.php?type="+Button+"&nameid="+NameID}
if(url.indexOf("?")>-1){url=url+"&"}else{url=url+"?"}
url=url+"utm_source="+domain+"&utm_medium="+Screen+"-"+Button+"&utm_campaign=game-"+NameID;window.open(url)}
function OnGameStart(NameID,Times){console.log("call OnGameStart yiv.com, nameid: "+NameID+", Times: "+Times)}
function OnGamePause(NameID,Times){console.log("call OnGamePause yiv.com, nameid: "+NameID+", Times: "+Times)}
function OnGameLevelWin(NameID,Times){console.log("call OnGameLevelWin yiv.com, nameid: "+NameID)}
function OnGameLevelFail(NameID){console.log("call OnGameLevelFail yiv.com, nameid: "+NameID)}
function GetLanguageInGame(nameid){return GamesLanguage.en[nameid]}
//var d=new String(window.location.host);
//if((d.indexOf("yiv.com")==-1)&&(d.indexOf("localhost")==-1)&&(d.indexOf("gamedistribution.com")==-1))
//{window.location="https://www.yiv.com/?utm_source="+d+"&utm_medium=redirect&utm_campaign=cheater"}
	
function CreateToolTipDiv(width,height,Content){$("#ToolTipDivInGame").remove();$("body").append("<div id='ToolTipDivInGame' style='background:#f7d5fc;width:100%;height:100%;position:absolute;top:0;left:0;filter:alpha(opacity=90);-moz-opacity: 0.90;opacity: 0.90;z-index: 999;text-align:center;' onclick='$(this).remove();'><div style='background: #FFFFAA;color:#000; border: 1px solid #FF3334;border-radius: 5px 5px; -moz-border-radius: 5px; -webkit-border-radius: 5px; box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1); -webkit-box-shadow: 5px 5px rgba(0, 0, 0, 0.1); -moz-box-shadow: 5px 5px rgba(0, 0, 0, 0.1);font-family: Calibri, Tahoma, Geneva, sans-serif; z-index: 1000; margin:auto auto;padding-top:20px; width: "+width+"px;height:"+height+"px;text-align:center;position: relative;top: 50%;-webkit-transform: translateY(-50%);-ms-transform: translateY(-50%);transform: translateY(-50%);font-size:16px;line-height:16px;'>"+Content+"<div style='position:absolute;top:-12px;right:-12px;'><img src='/images/blue/del.png'></div></div></div>")}
function submitToFacebook(CanvasID,Message,NameID,callback_success,callback_failed){Message="Play The Game: https://www.yiv.com/"+NameID;$.ajaxSetup({cache:!0});if(typeof(FB)!='undefined'){FBOperation(CanvasID,Message,callback_success,callback_failed)}else{$.getScript('https://connect.facebook.com/en_US/sdk.js',function(){FBOperation(CanvasID,Message,callback_success,callback_failed)})}
CreateToolTipDiv(200,60,"Sharing to Facebook... Be Patient Please")}
function FBOperation(CanvasID,Message,callback_success,callback_failed){FB.init({appId:'836700136395273',version:'v2.0',cookie:!0,xfbml:!0,frictionlessRequests:!0,oauth:!0});FB.login(function(response){if(response.authResponse){window.authToken=response.authResponse.accessToken;PostImageToFacebook(window.authToken,CanvasID,Message,callback_success,callback_failed)}else{callback_failed();CreateToolTipDiv(220,40,"Shared Failed, Please Try Again.")}},{scope:'publish_actions'})}
function PostImageToFacebook(authToken,CanvasID,Message,callback_success,callback_failed){if(Message==""||typeof(Message)=='undefined'){Message=""}
var canvas=document.getElementById(CanvasID);var imageData=canvas.toDataURL("image/png");try{blob=dataURItoBlob(imageData)}catch(e){}
var fd=new FormData();fd.append("access_token",authToken);fd.append("source",blob);fd.append("message",Message);try{$.ajax({url:"https://graph.facebook.com/v2.0/me/photos?access_token="+authToken,type:"POST",data:fd,processData:!1,contentType:!1,cache:!1,success:function(data){callback_success();CreateToolTipDiv(220,40,"Shared Successfully, thank you!")},error:function(shr,status,data){callback_failed();CreateToolTipDiv(220,40,"Shared Failed, Please Try Again.")},complete:function(){}})}catch(e){}}
function dataURItoBlob(dataURI){var byteString=atob(dataURI.split(',')[1]);
var ab=new ArrayBuffer(byteString.length);var ia=new Uint8Array(ab);for(var i=0;i<byteString.length;i++){ia[i]=byteString.charCodeAt(i)}
return new Blob([ab],{type:'image/png'})}


