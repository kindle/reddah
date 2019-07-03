import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { InfiniteScroll, Content, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';
import { GroupChatOptPage } from '../chat/group-chat-opt/group-chat-opt.page';
import { UserPage } from '../common/user/user.page';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
//import { AngularFireDatabase } from 'angularfire2/database';
//import { Firebase } from '@ionic-native/firebase/ngx';
import { ChatBase } from './chat.page';

@Component({
    selector: 'app-group-chat',
    templateUrl: './chat.page.html',
    styleUrls: ['./chat.page.scss'],
})
export class GroupChatPage extends ChatBase implements OnInit {

    @Input() targetUsers: any;
    @Input() groupChat;
    @ViewChild('chatbox') chatbox;
    

    userName: string;
    locale: string;

    message:string = ''
    messages: object[];

    constructor(
        public modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        private transfer: FileTransfer, 
        private file: File,
        private media: Media,
        private platform: Platform,
        //public db: AngularFireDatabase,
        //private firebase: Firebase
    ) { 
        super(modalController, reddah);
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }
    
    chatId = -1;
    title;
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
            console.log(this.groupChat)
            this.getGroupChat();
            this.title = this.groupChat.Title;
            this.chatId = this.groupChat.Id;
        }
        
    }

    async childReloadComments(event){
        this.getGroupChat();
    }

    @ViewChild('pageTop') pageTop: Content;

    async createGroupChat(){
        let formData = new FormData();
        formData.append("targetUsers", JSON.stringify(this.targetUsers.map(t=>t.Watch)));
        this.reddah.createGroupChat(formData).subscribe(data=>{
            if(data.Success==0)
            {
                console.log("asdf"+data);
                //this.messages =  data.Message.Comments;
                //this.groupChat.Id = data.Message.Id;
                this.groupChat = data.Message;
                this.title = this.groupChat.Title;
                this.chatId = this.groupChat.Id;

                setTimeout(() => {
                    if(this.pageTop.scrollToBottom){
                        this.pageTop.scrollToBottom(0);
                    }
                },200)
                
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
            let target = this.file.externalRootDirectory +"reddah/"+ guidName;
            this.file.checkFile(this.file.externalRootDirectory +"reddah/", guidName)
            //let target = this.file.applicationStorageDirectory + guidName;
            //this.file.checkFile(this.file.applicationStorageDirectory, guidName)
            .then(_ =>{
                this.localStorageService.store(guidName, target);
            })
            .catch(err =>{
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
    
    async getGroupChat(){
        let formData = new FormData();
        formData.append("groupChatId", JSON.stringify(this.groupChat.Id));
        this.reddah.getGroupChat(formData).subscribe(data=>{
            if(data.Success==0)
            {
                console.log(data);
                this.messages =  data.Message.Comments;
                setTimeout(() => {
                    if(this.pageTop.scrollToBottom){
                        this.pageTop.scrollToBottom(0);
                    }
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

    

    async close() {
        await this.modalController.dismiss();
    }

    async option(){
        const modal = await this.modalController.create({
            component: GroupChatOptPage,
            componentProps: { 
                targetUsers: this.targetUsers,
                groupInfo: this.groupChat
            }
        });
        
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data=='delete'){
            await this.modalController.dismiss('delete');
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
}
