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
    groupChatId = -1;

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
    
    sendChatButtonDisabled = true;
    
    groupInfo;
    ngOnInit() {
        //this.db.list('/chat').valueChanges().subscribe(data => {
        //    console.log(data)
        //    this.messages = data
        //});

        this.getGroupChat();
        
    }

    async childReloadComments(event){
        this.getGroupChat();
    }

    @ViewChild('pageTop') pageTop: Content;
    async getGroupChat(){
        return;
        let formData = new FormData();
        formData.append("targetUsers", this.targetUsers.map(t=>t.Watch));
        this.reddah.getGroupChat(formData).subscribe(data=>{
            if(data.Success==0)
            {
                this.sendChatButtonDisabled = false;
                console.log(data);
                this.messages =  data.Message.Comments;
                this.chatId = data.Message.Group.Id;
                this.groupInfo = data.Message.Group;
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
            componentProps: { targetUsers: this.targetUsers }
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
