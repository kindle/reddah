import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { InfiniteScroll, Content, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';
import { ChatOptPage } from '../chat/chat-opt/chat-opt.page';
import { UserPage } from '../common/user/user.page';
//import { AngularFireDatabase } from 'angularfire2/database';
//import { Firebase } from '@ionic-native/firebase/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { ImageViewerComponent } from '../common/image-viewer/image-viewer.component';
import { VideoViewerComponent } from '../common/video-viewer/video-viewer.component';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { VideoEditor } from '@ionic-native/video-editor/ngx'
import { PubPage } from '../tabs/publisher/pub/pub.page';

export class ChatBase{
    
    constructor(
        protected modalController: ModalController,
        protected reddah: ReddahService,
        protected streamingMedia: StreamingMedia,
        protected videoEditor: VideoEditor,
        protected platform: Platform,
    ){}

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

}

@Component({
    selector: 'app-chat',
    templateUrl: './chat.page.html',
    styleUrls: ['./chat.page.scss'],
})
export class ChatPage extends ChatBase implements OnInit  {

    @Input() title: any;
    @Input() target: any;
    @Input() source;//source ==pub or ""
    
    @ViewChild('chatbox') chatbox;

    userName: string;
    locale: string;

    message:string = ''
    messages: object[];

    //placeholder
    groupChat;

    constructor(
        public modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        private media: Media,
        private nativeAudio: NativeAudio,
        private transfer: FileTransfer, 
        private file: File,
        public platform: Platform,
        public streamingMedia: StreamingMedia,
        public videoEditor: VideoEditor,
        //public db: AngularFireDatabase,
        //private firebase: Firebase
    ) { 
        super(modalController, reddah, streamingMedia, videoEditor, platform);
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }
    
    chatId = -1;
    ngOnInit() {
        //this.db.list('/chat').valueChanges().subscribe(data => {
        //    console.log(data)
        //    this.messages = data
        //});

        this.getChat();
        
    }

    async childReloadComments(event){
        this.getChat();
    }

    @ViewChild('pageTop') pageTop: Content;
    async getChat(){
        let formData = new FormData();
        formData.append("targetUser", this.target);
        this.reddah.getChat(formData).subscribe(data=>{
            if(data.Success==0)
            {
                console.log(data);
                this.messages =  data.Message.Comments;
                this.chatId = data.Message.Seed;
                setTimeout(() => {
                        this.pageTop.scrollToBottom(0);
                },200)
                if(this.platform.is('cordova'))
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
                alert(data);
            }
        });
    }

    private fileTransfer: FileTransferObject; 
    async preload(guidName){
        let path = this.localStorageService.retrieve(guidName);

        if(path==null){
            let target = this.file.externalRootDirectory +"reddah/"+ guidName;
            this.file.checkFile(this.file.externalRootDirectory +"reddah/", guidName)
            .then(_ =>{
                this.localStorageService.store(guidName, target);
            })
            .catch(err =>{
                this.fileTransfer = this.transfer.create();  
                this.fileTransfer.download("https://login.reddah.com/uploadPhoto/"+guidName, target, true).then((entry) => {
                    this.localStorageService.store(guidName, target);
                }, (error) => {
                    console.log(JSON.stringify(error));
                    alert(JSON.stringify(error));
                });
            });
        }
        
    }

    async play(audioFileName){
        let target = this.file.externalRootDirectory +"reddah/";
        //let target = this.file.applicationStorageDirectory;

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
                console.log(JSON.stringify(error));
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
                componentProps: { userName: this.target }
            });
              
            await modal.present();
        }
        else
        {
            const modal = await this.modalController.create({
                component: ChatOptPage,
                componentProps: { targetUser: this.target }
            });
            
            await modal.present();
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
            }
        });
            
        await userModal.present();
    }

    async viewer(index, imageSrcArray) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
                index: index,
                imgSourceArray: imageSrcArray,
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

