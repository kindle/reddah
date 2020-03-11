import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { IonInfiniteScroll, IonContent, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';
import { GroupChatOptPage } from '../chat/group-chat-opt/group-chat-opt.page';
import { UserPage } from '../common/user/user.page';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { VideoEditor } from '@ionic-native/video-editor/ngx'
//import { AngularFireDatabase } from 'angularfire2/database';
//import { Firebase } from '@ionic-native/firebase/ngx';
import { ChatBase } from './chat.page';

@Component({
    selector: 'app-group-chat',
    templateUrl: './chat.page.html',
    styleUrls: ['./chat.page.scss'],
})
export class GroupChatPage extends ChatBase implements OnInit {

    @ViewChild('pageTop') pageTop: IonContent;
    @ViewChild('chatbox') chatbox;

    @Input() targetUsers: any;
    @Input() groupChat;

    title;
    chatId = -1;

    constructor(
        public modalController: ModalController,
        public reddah: ReddahService,
        public localStorageService: LocalStorageService,
        private cacheService: CacheService,
        private transfer: FileTransfer, 
        private file: File,
        private media: Media,
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

        ///if(false)
            //creategroupchat;
        //this.getGroupChat();
        if(this.targetUsers!=null&&this.groupChat==null){
            this.createGroupChat();
        }
        else{
            this.getGroupChat();
            this.title = this.groupChat.Title;
            this.chatId = this.groupChat.Id;
        }
        
    }

    async createGroupChat(){
        let formData = new FormData();
        formData.append("targetUsers", JSON.stringify(this.targetUsers.map(t=>t.Watch)));
        this.reddah.createGroupChat(formData).subscribe(data=>{
            if(data.Success==0)
            {
                //this.messages =  data.Message.Comments;
                //this.groupChat.Id = data.Message.Id;
                this.groupChat = data.Message;
                this.title = this.groupChat.Title;
                this.chatId = this.groupChat.Id;

                
                if(this.pageTop.scrollToBottom){
                    this.pageTop.scrollToBottom(0);
                }
                
                
                this.cacheService.clearGroup("ChatChooseGroupPage");
            }
            else{
                alert(JSON.stringify(data));
            }
        });
    }

    private fileTransfer: FileTransferObject; 
    async preload(guidName){
        let path = this.localStorageService.retrieve(guidName);

        if(path==null){
            this.fileTransfer = this.transfer.create();  
            let target = this.reddah.getDeviceDirectory() +"reddah/"+ guidName;
            this.file.checkFile(this.reddah.getDeviceDirectory() +"reddah/", guidName)
            //let target = this.file.applicationStorageDirectory + guidName;
            //this.file.checkFile(this.file.applicationStorageDirectory, guidName)
            .then(_ =>{
                this.localStorageService.store(guidName, target);
            })
            .catch(err =>{
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

    //test
    clear(){
        this.localStorageService.clear(`Reddah_Chat_${this.groupChat.Id}`);
        this.messages = [];
    }

    async childReloadComments(event){
        this.hasNewMsg = true;
        this.getGroupChat();
    }

    async childLocalComments(event){
        //console.log("$$#")
        //console.log(event)
    }
    
    async getMoreHistory(evt){
        let min = Math.min.apply(null,this.messages.map(item=>item["Id"]));
        this.getHistory(-1*min, 20, evt);
    }

    async getGroupChat(){
        let chatHistory = this.localStorageService.retrieve(`Reddah_Chat_${this.groupChat.Id}`);
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
        id = id<0?0:id;//error handling
        formData.append("groupChatId", JSON.stringify(this.groupChat.Id));
        formData.append("id", JSON.stringify(id));
        formData.append("limit", JSON.stringify(limit));
        this.reddah.getGroupChat(formData).subscribe(data=>{
            if(data.Success==0)
            {
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
                    this.messages = this.messages.concat(data.Message.Comments);
                    setTimeout(() => {
                        if(this.pageTop.scrollToBottom)
                            this.pageTop.scrollToBottom(0);
                    },200)
                }
                this.localStorageService.store(`Reddah_Chat_${this.groupChat.Id}`, this.messages);

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
                alert(JSON.stringify(data));
            }
        });
    }

    

    async close() {
        await this.modalController.dismiss();
    }

    async option(){
        const modal = await this.modalController.create({
            component: GroupChatOptPage,
            componentProps: { 
                targetUsers: this.targetUsers,
                groupInfo: this.groupChat
            },
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data=='delete'){
            await this.modalController.dismiss('delete');
        }
        else if(data=="update"){
            this.childReloadComments(null);
        }
        else if(data=="clearchat")
        {
            this.clear();
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
