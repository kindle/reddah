import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';
import { GroupChatOptPage } from '../chat/group-chat-opt/group-chat-opt.page';
import { UserPage } from '../common/user/user.page';
//import { AngularFireDatabase } from 'angularfire2/database';
//import { Firebase } from '@ionic-native/firebase/ngx';


@Component({
    selector: 'app-group-chat',
    templateUrl: './group-chat.page.html',
    styleUrls: ['./group-chat.page.scss'],
})
export class GroupChatPage implements OnInit {

    @Input() targetUsers: any;
    @Input() groupChat;
    @ViewChild('chatbox') chatbox;
    

    userName: string;
    locale: string;

    message:string = ''
    messages: object[];

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        //public db: AngularFireDatabase,
        //private firebase: Firebase
    ) { 
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
                console.log(data);
                //this.messages =  data.Message.Comments;
                //this.groupChat.Id = data.Message.Id;
                this.groupChat = data.Message;
                console.log(this.groupChat);

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
