import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';
import { AngularFireDatabase } from 'angularfire2/database';
//import { Firebase } from '@ionic-native/firebase/ngx';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';

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
        public db: AngularFireDatabase,
        //private firebase: Firebase,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }
    hubConnection;
    async ngOnInit() {
        this.db.list('/chat').valueChanges().subscribe(data => {
            console.log(data)
            this.messages = data
          });

          /*this.firebase.getToken()
            .then(token => console.log(`The token is ${token}`)) // save the token server-side and use it to push notifications to this device
            .catch(error => console.error('Error getting token', error));

            this.firebase.onNotificationOpen()
            .subscribe(data => console.log(`User opened a notification ${data}`));

            this.firebase.onTokenRefresh()
            .subscribe((token: string) => console.log(`Got a new token ${token}`));*/
/*
            this.hubConnection = new HubConnection('https://chat.reddah.com/chat');

            this.hubConnection
            .start()
            .then(() => console.log('Connection started!'))
            .catch(err => console.log('Error while establishing connection :('));

            }*/




            let connection = new HubConnectionBuilder()
                .withUrl("http://chat.reddah.com")
                .build();
            
            connection.on("send", data => {
                console.log(data);
            });
            
            connection.start()
                .then(() => connection.invoke("send", "Hello"));
    }

    async close() {
        await this.modalController.dismiss();
    }

    async option(){
        
    }

    sendMessage(){
        console.log('send msg')
        this.db.list('/chat').push({
            userName: this.userName,
            message: this.message
        }).then(() => {
            this.message = 'err'
        })
      }
}
