import { Component, OnInit, Input, ViewChild, Directive } from '@angular/core';
import { IonInfiniteScroll, IonContent, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';
import { ChatOptPage } from '../chat/chat-opt/chat-opt.page';
import { UserPage } from '../common/user/user.page';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { ImageViewerComponent } from '../common/image-viewer/image-viewer.component';
import { VideoViewerComponent } from '../common/video-viewer/video-viewer.component';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { VideoEditor } from '@ionic-native/video-editor/ngx'
import { PubPage } from '../tabs/publisher/pub/pub.page';
import { Capacitor } from '@capacitor/core';

@Directive()
export class ChatBase{
    
    @Input() hasNewMsg: boolean;

    constructor(
        protected modalController: ModalController,
        protected reddah: ReddahService,
        protected localStorageService: LocalStorageService,
        protected streamingMedia: StreamingMedia,
        protected videoEditor: VideoEditor,
        protected platform: Platform,
    ){}

    userName: string;
    locale: string;

    message:string = ''
    messages: object[];

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

    async playVideo(comment){
        let key = comment.Content.toString().toLowerCase();
        if(this.reddah.isMobile()){
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
                    
                    let playWebUrlPath = Capacitor.convertFileSrc(localPath);
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

}

@Component({
    selector: 'app-chat',
    templateUrl: './chat.page.html',
    styleUrls: ['./chat.page.scss'],
})
export class ChatPage extends ChatBase implements OnInit  {

    @ViewChild('pageTop') pageTop: IonContent;
    @ViewChild('chatbox') chatbox;

    @Input() title: any;
    @Input() target: any;
    @Input() source;//source ==pub or ""

    //placeholder
    groupChat;

    chatId = -1;

    constructor(
        public modalController: ModalController,
        public reddah: ReddahService,
        public localStorageService: LocalStorageService,
        private cacheService: CacheService,
        private media: Media,
        private transfer: FileTransfer, 
        private file: File,
        public platform: Platform,
        public streamingMedia: StreamingMedia,
        public videoEditor: VideoEditor,
        //public db: AngularFireDatabase,
        //private firebase: Firebase
    ) { 
        super(modalController, reddah, localStorageService, streamingMedia, videoEditor, platform);
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }
    
    ngOnInit() {
        //this.db.list('/chat').valueChanges().subscribe(data => {
        //    console.log(data)
        //    this.messages = data
        //});

        this.getChat();
        
    }
    
    //test
    clear(){
        this.localStorageService.clear(`Reddah_Chat_${this.target}`);
        this.messages = [];
    }

    async childReloadComments(event){
        this.hasNewMsg = true;
        this.getChat();
    }

    async childLocalComments(event){
        let newmessage = { 
            ArticleId: event.id, 
            Content: event.text, 
            UserName: this.userName,
            Type: event.type,
            Uid: event.uid
        }
        this.messages.push(newmessage);
        
        
        if(this.pageTop.scrollToBottom)
            this.pageTop.scrollToBottom(0);
    
    }

    async getMoreHistory(evt){
        let min = Math.min.apply(null,this.messages.map(item=>item["Id"]));
        this.getHistory(-1*min, 20, evt);
    }
    
    async getChat(){
        let chatHistory = this.localStorageService.retrieve(`Reddah_Chat_${this.target}`);
        if(chatHistory==null){
            //get latest 20 messages;
            this.getHistory(0, 20);
        }else{
            /*if(this.hasNewMsg){
                this.messages = chatHistory;
                //get all latest messages;
                let max = Math.max.apply(null,this.messages.map(item=>item["Id"]));
                this.getHistory(max, 0);
            }
            else{
                this.messages = chatHistory;
                setTimeout(() => {
                    this.pageTop.scrollToBottom(0);
                },200)
            }*/
            this.messages = chatHistory;
            //get all latest messages;
            let max = Math.max.apply(null,this.messages.map(item=>item["Id"]));
            this.getHistory(max, 0);
        }
    }

    async getHistory(id, limit, event=null){
        let formData = new FormData();
        formData.append("targetUser", this.target);
        formData.append("id", JSON.stringify(id));
        formData.append("limit", JSON.stringify(limit));
        this.reddah.getChat(formData).subscribe(data=>{
            if(data.Success==0)
            {
                this.chatId = data.Message.Seed;
                this.chatbox.selectedArticleId = this.chatId;
                if(id==0){//first load
                    this.messages =  data.Message.Comments;
                    setTimeout(() => {
                        if(this.pageTop.scrollToBottom)
                            this.pageTop.scrollToBottom(0);
                    },200)
                }
                else if(id<0){//get previous
                    this.messages = data.Message.Comments.concat(this.messages);
                }
                else{//new msg came in.
                    //this.messages = this.messages.concat(data.Message.Comments);
                    this.messages = this.messages.concat(data.Message.Comments.filter((item)=>
                    {
                        return this.messages.map(m=>m["uid"]).indexOf(item.uid) < 0;
                    }));


                    setTimeout(() => {
                        if(this.pageTop.scrollToBottom)
                            this.pageTop.scrollToBottom(0);
                    },200)
                }
                this.localStorageService.store(`Reddah_Chat_${this.target}`, this.messages);

                if(event!=null){
                    event.target.complete();
                }

                if(this.reddah.isMobile())
                {
                    this.messages.forEach((comment:any)=>{
                        if(comment.Type==1&&comment.Duration>=0)//audio only
                        {
                            this.preload(comment["Content"]);   
                        }
                    })
                }
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
            //let target = this.reddah.getDeviceDirectory() +"reddah/"+ guidName;
            let target = this.reddah.getDeviceDirectory() + guidName;
            //this.file.checkFile(this.reddah.getDeviceDirectory() +"reddah/", guidName)
            this.file.checkFile(this.reddah.getDeviceDirectory(), guidName)
            .then(_ =>{
                this.localStorageService.store(guidName, target);
            })
            .catch(err =>{
                this.fileTransfer = this.transfer.create();  
                this.fileTransfer.download(this.reddah.storageFile+guidName, target, true).then((entry) => {
                    this.localStorageService.store(guidName, target);
                }, (error) => {
                    //console.log(JSON.stringify(error));
                    alert(JSON.stringify(error));
                });
            });
        }
        
    }

    async play(audioFileName){
        //let target = this.reddah.getDeviceDirectory() +"reddah/";
        let target = this.reddah.getDeviceDirectory();
        //let target = this.file.applicationStorageDirectory;

        //error handling, check again
        this.file.checkFile(target, audioFileName)
        .then(_ =>{
            this.localStorageService.store(audioFileName, target);
            let player = this.media.create(target.replace(/^file:\/\//, '') + audioFileName);
            player.play();
        })
        .catch(err =>{
            this.fileTransfer.download(this.reddah.storageFile+audioFileName, target+ audioFileName, true).then((entry) => {
                this.localStorageService.store(audioFileName, target);
                let player = this.media.create(target.replace(/^file:\/\//, '') + audioFileName);
                player.play();
            }, (error) => {
                //console.log(JSON.stringify(error));
                alert(JSON.stringify(error));
            });
        });
        
    }

    async close() {
        await this.modalController.dismiss();
    }

    async option(){
        if(this.source){
            const modal = await this.modalController.create({
                component: PubPage,
                componentProps: { userName: this.target },
                cssClass: "modal-fullscreen",
            });
              
            await modal.present();
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

    async checkIsToday(date){
        let cur = new Date(date);
        return cur.getDate()==new Date().getDate();
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

