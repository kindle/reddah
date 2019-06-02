import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';
import { createChangeDetectorRef } from '@angular/core/src/view/refs';
import { getOrCreateChangeDetectorRef } from '@angular/core/src/render3/di';
//import { AngularFireDatabase } from 'angularfire2/database';
//import { Firebase } from '@ionic-native/firebase/ngx';


@Component({
    selector: 'app-chat',
    templateUrl: './chat.page.html',
    styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

    @Input() title: any;
    @Input() target: any;

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
    chatId = -1;
    ngOnInit() {
        //this.db.list('/chat').valueChanges().subscribe(data => {
        //    console.log(data)
        //    this.messages = data
        //});

        this.getChat();
        
    }

    @ViewChild('pageTop') pageTop: Content;
    async getChat(){
        let formData = new FormData();
        formData.append("targetUser", this.target);
        this.reddah.getChat(formData).subscribe(data=>{
            if(data.Success==0)
            {
                this.sendChatButtonDisabled = false;
                console.log(data);
                this.messages =  data.Message.Comments;
                this.chatId = data.Message.Seed;
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
        
    }

    async checkIsToday(date){
        let cur = new Date(date);
        return cur.getDate()==new Date().getDate();
    }

    sendMessage(){
        this.reddah.addComments(this.chatId, -1, this.message).subscribe(data=>{
            this.getChat();
        });
        this.message = "";
    }

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
}
