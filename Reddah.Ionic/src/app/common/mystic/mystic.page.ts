import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController, Platform, Content } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { ImageViewerComponent } from '../../common/image-viewer/image-viewer.component';
import { VideoViewerComponent } from '../../common/video-viewer/video-viewer.component';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { VideoEditor } from '@ionic-native/video-editor/ngx'
import { ChatPopPage } from '../../common/chat-pop.page';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

@Component({
    selector: 'app-mystic',
    templateUrl: 'mystic.page.html',
    styleUrls: ['mystic.page.scss']
})
export class MysticPage implements OnInit {

    @Input() hasNewMsg: boolean;


    userName: string;
    locale: string;

    message:string = ''
    messages: object[];

    
    constructor(
        public modalController: ModalController,
        public popoverController: PopoverController,
        public reddah: ReddahService,
        public localStorageService: LocalStorageService,
        private media: Media,
        private nativeAudio: NativeAudio,
        private transfer: FileTransfer, 
        private file: File,
        public platform: Platform,
        public streamingMedia: StreamingMedia,
        public videoEditor: VideoEditor,
        public clipboard: Clipboard,
        private notification: LocalNotifications,
        //public db: AngularFireDatabase,        
    ) { 
        
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
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

    

    
    @ViewChild('pageTop') pageTop: Content;
    @ViewChild('chatbox') chatbox;

    @Input() title: any;
    @Input() target: any;
    @Input() source;//source ==pub or ""

    //placeholder
    groupChat;

    chatId = -1;

    
    ngOnInit() {
        this.getChat();
        this.refreshPage = setInterval(()=>{
            this.getChat();
        },5000)
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
            Id:null,
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
        let min = Math.min.apply(null,this.messages.map(item=>item["Id"]).filter(m=>m!=null));
        this.getHistory(-1*min, 20, evt);
    }
    
    async getChat(){
        let chatHistory = this.localStorageService.retrieve(`Reddah_Chat_${this.target}`);
        if(chatHistory==null){
            //get latest 20 messages;
            this.getHistory(0, 20);
        }else{
            this.messages = chatHistory;
            //get all latest messages;
            let max = Math.max.apply(null,this.messages.map(item=>item["Id"]).filter(m=>m!=null));
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
                /*if(!this.firebaseInited)
                {
                    this.initFirebase();
                }*/

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
                    try{
                        //update local
                        this.messages.forEach((item,index)=>{
                            if(item["Id"]==null){
                                let mact = data.Message.Comments.filter(n=>n["Uid"]==item["Uid"]);
                                if(mact!=null){
                                    this.messages[index]["Id"] = mact[0]["Id"];
                                    this.messages[index]["Content"] = mact[0]["Content"];
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
                            icon: m.UserPhoto.replace("///","https")
                        });
                    })

                    //console.log(this.messages)
                    this.messages.sort((a,b)=>a["Id"]-b["Id"]);
                    
                    setTimeout(() => {
                        if(this.pageTop.scrollToBottom&&!this.didScrollUp)
                            this.pageTop.scrollToBottom(0);
                    },200)
                }
                this.localStorageService.store(`Reddah_Chat_${this.target}`, this.messages);

                if(event!=null){
                    event.target.complete();
                }

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

    async play(audioFileName){
        let target = this.reddah.getDeviceDirectory() +"reddah/";
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

