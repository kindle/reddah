import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Content, Platform } from '@ionic/angular';
import { ModalController, PopoverController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';
import { ChatOptPage } from '../chat/chat-opt/chat-opt.page';
import { UserPage } from '../common/user/user.page';
//import { AngularFireDatabase } from '@angular/fire/database';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { ImageViewerComponent } from '../common/image-viewer/image-viewer.component';
import { VideoViewerComponent } from '../common/video-viewer/video-viewer.component';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { VideoEditor } from '@ionic-native/video-editor/ngx'
import { ChatPopPage } from '../common/chat-pop.page';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

export class ChatFireBase{
    
    @Input() hasNewMsg: boolean;
    @ViewChild('chatbox') chatbox;

    constructor(
        protected modalController: ModalController,
        protected popoverController: PopoverController,
        protected reddah: ReddahService,
        protected localStorageService: LocalStorageService,
        protected streamingMedia: StreamingMedia,
        protected videoEditor: VideoEditor,
        protected platform: Platform,
        protected clipboard: Clipboard,
        protected nativeAudio: NativeAudio,
    ){
        if (this.platform.is('cordova')) {
            this.nativeAudio.preloadSimple('bi', 'assets/sound/bi.mp3')
        }
    }

    userName: string;
    locale: string;

    message:string = ''
    messages: object[];

    speakPressing = false;
    speakPress(){
        this.speakPressing = true;
    }

    speakUnPress(){
        this.speakPressing = false;
    }
    audio = new Audio();
    lastPlayComment = null;
    async play(comment){
        if(!comment.isPlaying){
            if(this.lastPlayComment!=null){
                this.lastPlayComment.isPlaying = false;
            }
            let audioChatUrl = "https://login.reddah.com/uploadPhoto/"+comment.Content;
            comment.isPlaying= true;
            this.audio.src = audioChatUrl; 
            this.audio.play();
            this.audio.addEventListener('ended', ()=>{
                if(comment.isPlaying){
                    this.nativeAudio.play("bi");
                }
                comment.isPlaying= false;
            });
            this.localStorageService.store("Reddah_Audio_Chat_Id_"+comment.Id,"Played")
            this.lastPlayComment = comment;
        }
    }

    audioPlayed(comment){
        return this.localStorageService.retrieve("Reddah_Audio_Chat_Id_"+comment.Id)!=null;
    }
///pop up new window
    async htmlPlayVideo(id, src, poster){
        
        const modal = await this.modalController.create({
            component: VideoViewerComponent,
            componentProps: {
                id: id,
                src: src,
                poster: poster,
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true
        });
    
        await modal.present();

    }

    copyToInput(content){
        this.chatbox.commentContent = content;
    }

    async playVideo(comment){
        let key = comment.Content.toString().toLowerCase();
        if(this.platform.is('cordova')){
            let isLocal = this.reddah.isLocal(key);
            if(isLocal){//play
                let localPath = this.reddah.appData(key);
                //alert(key+localPath)
                this.videoEditor.getVideoInfo({fileUri: localPath})
                .then(info=>{
                    let options: StreamingVideoOptions = {
                        successCallback: () => { console.log('Video played') },
                        errorCallback: (e) => { alert('Error streaming:'+JSON.stringify(e)) },
                        orientation: info.orientation,
                        shouldAutoClose: true,
                        controls: true
                    };
                    
                    let playWebUrlPath = (<any>window).Ionic.WebView.convertFileSrc(localPath);
                    //this.streamingMedia.playVideo(playWebUrlPath, options);
                    this.htmlPlayVideo(comment.Id, playWebUrlPath, this.reddah.chatImageCache(comment.Content.toLowerCase().replace('.mp4','.jpg')));
                })
                .catch(err=>{alert(JSON.stringify(err))})

                
            }
            else{//download
                this.reddah.toFileCache(key, true);
            }
        }
        else{
            this.htmlPlayVideo(comment.Id, key, this.reddah.chatImageCache(comment.Content.toLowerCase().replace('.mp4','.jpg')));            
        }
    }

    async viewer(index, imageSrcArray) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
                index: index,
                imgSourceArray: this.reddah.preImageArray(imageSrcArray),
                imgTitle: "",
                imgDescription: "",
                showDownload: true,
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true
        });
    
        return await modal.present();
    }

    refreshPage;
    ionViewWillLeave() {
        clearInterval(this.refreshPage);
    }

    private lastScrollTop: number = 0;
    didScrollUp = false;
    onScroll($event) {
        let currentScrollTop = $event.detail.scrollTop;
        
        if(currentScrollTop > this.lastScrollTop)
        {
            //'down';

        }
        else
        {
            //'up';
            this.didScrollUp = true;
        }
        this.lastScrollTop = currentScrollTop;
    }

    async showChatMenu(ev: any, content){
        const popover = await this.popoverController.create({
            component: ChatPopPage,
            event: ev,
            cssClass: 'chat-pop-popover'
        });

        await popover.present();
        const { data } = await popover.onDidDismiss();
        
        if(data==1)//copy
        {
            this.clipboard.copy(content);
        }
    }

}

@Component({
    selector: 'app-chat-fire',
    templateUrl: './chat-fire.page.html',
    styleUrls: ['./chat-fire.page.scss'],
})
export class ChatFirePage extends ChatFireBase implements OnInit  {

    @ViewChild('pageTop') pageTop: Content;

    @Input() title: any;
    @Input() target: any;
    @Input() source;//source ==pub or ""

    //placeholder
    groupChat;

    chatId = -1;

    constructor(
        public modalController: ModalController,
        public popoverController: PopoverController,
        public reddah: ReddahService,
        public localStorageService: LocalStorageService,
        private media: Media,
        private transfer: FileTransfer, 
        private file: File,
        public platform: Platform,
        public streamingMedia: StreamingMedia,
        public videoEditor: VideoEditor,
        public clipboard: Clipboard,
        public nativeAudio: NativeAudio,
        private notification: LocalNotifications,
        //public db: AngularFireDatabase,        
    ) { 
        super(modalController, popoverController, reddah, localStorageService, 
            streamingMedia, videoEditor, platform, clipboard, nativeAudio);
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }
    
    ngOnInit() {
        this.getChat();
        this.refreshPage = setInterval(()=>{
            this.getChat();
        },5000)
    }

    /*
    firebaseInited = false;
    initFirebase(){
        this.firebaseInited = true;
        if(this.chatId>0){

            this.db.list(this.chatId+"").valueChanges()
            .subscribe(dataMessageComments => {
                this.reddah.toast(JSON.stringify(dataMessageComments))
                //sync others
                this.messages = this.messages.concat(dataMessageComments.filter(item=>
                    !this.messages.map(m=>m["Uid"]).includes(item["Uid"])
                ));

                //sync up
                this.getChat();
            });
        }
    }
    */
    
    //test
    clear(){
        this.localStorageService.clear(`Reddah_Chat_${this.chatId}`);
        this.messages = [];
    }

    async childReloadComments(event){
        //console.log('ui refresh again')
        this.hasNewMsg = true;
        this.getChat();
    }

    async childLocalComments(event){
        let newmessage = {
            Id:null,
            ArticleId: event.id, 
            Content: event.text, 
            UserName: this.userName,
            Type: event.type,
            Uid: event.uid
        }
        this.messages.push(newmessage);
        
        this.scrollToBottom();
    }

    private scrollToBottom(){
        setTimeout(() => {
            if(this.pageTop.scrollToBottom)
                this.pageTop.scrollToBottom(0);
        },200)
    }

    async getMoreHistory(evt){
        let min = Math.min.apply(null,this.messages.map(item=>item["Id"]).filter(m=>m!=null));
        this.getHistory(-1*min, 20, evt);
    }
    
    async getChat(){
        let chatHistory = this.localStorageService.retrieve(`Reddah_Chat_${this.chatId}`);
        if(this.chatId==-1||chatHistory==null){
            //get latest 20 messages;
            this.getHistory(0, 20);
            //console.log('chatid=-1 or no cache locally')
        }else{
            this.messages = chatHistory;
            //get all latest messages;
            let max = Math.max.apply(null,this.messages.map(item=>item["Id"]).filter(m=>m!=null));
            if(max==-Infinity)
            {
                this.getHistory(0, 20);
            }
            else{
                this.getHistory(max, 0);
            }
        }
    }

    async getHistory(id, limit, event=null){
        //console.log(id+"_"+limit)
        let formData = new FormData();
        formData.append("targetUser", this.target);
        formData.append("id", JSON.stringify(id));
        formData.append("limit", JSON.stringify(limit));
        this.reddah.getChat(formData).subscribe(data=>{
            if(data.Success==0)
            {
                this.chatId = data.Message.Seed;
                this.chatbox.selectedArticleId = this.chatId;
                /*if(!this.firebaseInited)
                {
                    this.initFirebase();
                }*/

                if(id==0){//first load
                    this.messages =  data.Message.Comments;
                    this.scrollToBottom();
                }
                else if(id<0){//get previous
                    //console.log("id<0...")
                    this.messages = data.Message.Comments.concat(this.messages);
                }
                else{//new msg came in.
                    //console.log('other new msg came in...')
                    try{
                        //update local
                        this.messages.forEach((item,index)=>{
                            if(item["Id"]==null){
                                //console.log('start compare')
                                let mact = data.Message.Comments.filter(n=>n["Uid"]==item["Uid"]);
                                if(mact!=null){
                                    //console.log(item)
                                    this.messages[index]["Id"] = mact[0]["Id"];
                                    this.messages[index]["Content"] = mact[0]["Content"];
                                    //console.log(this.messages)
                                }
                            }
                        });
                    }catch{}
                    //sync others
                    let otherMsgs = data.Message.Comments.filter(item=>
                        !this.messages.map(m=>m["Id"]).includes(item["Id"])
                    );
                    this.messages = this.messages.concat(otherMsgs);

                    otherMsgs.forEach((m, i)=>{
                        let ti = this.title;
                        let tx = "";
                        if(m.Type==0){
                            tx += `${this.reddah.summary(m.Content,100)}`
                        }
                        else if(m.Type==4){
                            tx += `[Link]`; 
                        }
                        
                        this.notification.schedule({
                            id: m.Id,
                            title: ti,
                            text: tx,
                            data: { secret: 'secret' },
                            foreground: true,
                            icon: m.UserPhoto?m.UserPhoto.replace("///","https"):m.UserPhoto
                        });
                    })

                    //console.log(this.messages)
                    this.messages.sort((a,b)=>a["Id"]-b["Id"]);
                    
                    setTimeout(() => {
                        if(this.pageTop.scrollToBottom&&!this.didScrollUp)
                            this.pageTop.scrollToBottom(0);
                    },200)
                }
                //console.log('save msg')
                //console.log(this.messages)
                this.localStorageService.store(`Reddah_Chat_${this.chatId}`, this.messages);

                if(event!=null){
                    event.target.complete();
                }
                /*if(this.platform.is('cordova'))
                {
                    this.messages.forEach((comment:any)=>{
                        if(comment.Type==1&&comment.Duration>=0)//audio only
                        {
                            this.preload(comment["Content"]);   
                        }
                    })
                }*/
            }
            else{
                //console.log(JSON.stringify(data));
            }
        });
    }
    

    private fileTransfer: FileTransferObject; 
    async preload(guidName){
        let path = this.localStorageService.retrieve(guidName);

        if(path==null){
            let target = this.reddah.getDeviceDirectory() +"reddah/"+ guidName;
            this.file.checkFile(this.reddah.getDeviceDirectory() +"reddah/", guidName)
            .then(_ =>{
                this.localStorageService.store(guidName, target);
            })
            .catch(err =>{
                this.fileTransfer = this.transfer.create();  
                this.fileTransfer.download("https://login.reddah.com/uploadPhoto/"+guidName, target, true).then((entry) => {
                    this.localStorageService.store(guidName, target);
                }, (error) => {
                    //console.log(JSON.stringify(error));
                    alert(JSON.stringify(error));
                });
            });
        }
        
    }

    //async play(audioFileName){
        /*
        if(this.platform.is('cordova')){
            let target = this.reddah.getDeviceDirectory() +"reddah/";
            //let target = this.file.applicationStorageDirectory;
            alert(target+audioFileName)

            //error handling, check again
            this.file.checkFile(target, audioFileName)
            .then(_ =>{
                this.localStorageService.store(audioFileName, target);
                let player = this.media.create(target.replace(/^file:\/\//, '') + audioFileName);
                player.play();
            })
            .catch(err =>{
                this.fileTransfer.download("https://login.reddah.com/uploadPhoto/"+audioFileName, target+ audioFileName, true).then((entry) => {
                    this.localStorageService.store(audioFileName, target);
                    let player = this.media.create(target.replace(/^file:\/\//, '') + audioFileName);
                    player.play();
                }, (error) => {
                    //console.log(JSON.stringify(error));
                    alert(JSON.stringify(error));
                });
            });
        }
        else{
            let audioChatUrl = "https://login.reddah.com/uploadPhoto/"+audioFileName;
            console.log(audioChatUrl)
            var audio = new Audio(audioChatUrl);
            audio.play();
        }*/
        //let audioChatUrl = "https://login.reddah.com/uploadPhoto/"+audioFileName;
        //var audio = new Audio(audioChatUrl);
        ///audio.play();
        //audio.addEventListener('ended', ()=>{
            
        //});
    //}

    async close() {
        await this.modalController.dismiss();
    }

    async option(){
        if(this.source){
            /*const modal = await this.modalController.create({
                component: PubPage,
                componentProps: { userName: this.target },
            cssClass: "modal-fullscreen",
            });
              
            await modal.present();*/
            this.close();
        }
        else
        {
            const modal = await this.modalController.create({
                component: ChatOptPage,
                componentProps: { targetUser: this.target },
                cssClass: "modal-fullscreen",
            });
            
            await modal.present();

            const { data } = await modal.onDidDismiss();
            if(data=="clearchat")
            {
                this.clear();
            }
        }
    }

    /*sendMessage(){
        this.reddah.addComments(this.chatId, -1, this.message).subscribe(data=>{
            this.getChat();
        });
        this.message = "";
    }*/

    /*sendMessage(){
        console.log('send msg')
        this.db.list('/chat').push({
            userName: this.userName,
            message: this.message
        }).then(() => {
            this.message = 'err'
        })
      }
      */

    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
        });
            
        await userModal.present();
    }

    

    
}

