import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { LocalePage } from '../../common/locale/locale.page';
import { UserPage } from '../../common/user/user.page';
import { ChatPage } from '../chat.page';
import { GroupChatPage } from '../group-chat.page';
import { ChatChooseGroupPage } from '../chat-choose-group/chat-choose-group.page';

@Component({
    selector: 'app-chat-choose-user',
    templateUrl: './chat-choose-user.page.html',
    styleUrls: ['./chat-choose-user.page.scss'],
})
export class ChatChooseUserPage implements OnInit {

    @Input() targetUser;
    userName;
    locale;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public authService: AuthService,
        private toastController: ToastController,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }


    ngOnInit() {
        this.loadData();
    }

    
    
    async close() {
        await this.modalController.dismiss();
    }

    
    submitClicked=false;
    async submit(){
        this.submitClicked= true;
        console.log(this.groupedContacts)

        let targetUsers = [];
        this.groupedContacts.forEach((item)=>{
            item.contacts.forEach((contact)=>{
                if(contact.isChecked==true)
                {
                    targetUsers.push(contact);
                }
            });
        });

        if(targetUsers.length==1){//2 people chat
            const modal = await this.modalController.create({
                component: ChatPage,
                componentProps: { 
                    title: this.reddah.appData('usernotename_'+targetUsers[0].Watch),
                    target: targetUsers[0].Watch,
                }
            });
            await modal.present();
            const {data} = await modal.onDidDismiss();
        }
        else//real group chat
        {
            const modal = await this.modalController.create({
                component: GroupChatPage,
                componentProps: {
                    targetUsers: targetUsers,
                }
            });
            await modal.present();
            //const {data} = await modal.onDidDismiss();
        }
    }

    contacts=[];
    groupedContacts = [];

    loadData(){
        let cacheKey = "this.reddah.getFriends";
        let request = this.reddah.getFriends();

        this.cacheService.loadFromObservable(cacheKey, request, "ContactPage")
        .subscribe(contacts => 
        {
            for(let contact of contacts){
                //check cache first
                let cachedUserPhotoPath = this.localStorageService.retrieve(`userphoto_${contact.Watch}`);
                if(cachedUserPhotoPath!=null){
                    this.reddah.appPhoto["userphoto_"+contact.Watch] = (<any>window).Ionic.WebView.convertFileSrc(cachedUserPhotoPath);
                }
                else{
                    this.reddah.appPhoto["userphoto_"+contact.Watch] = "assets/icon/anonymous.png";
                }
                if(contact.UserPhoto!=null){
                    this.reddah.toImageCache(contact.UserPhoto, `userphoto_${contact.Watch}`);
                }

                let cname = contact.NoteName ? contact.NoteName : contact.Watch;
                let ch = cname.charAt(0);
                console.log(ch)
                if(/^[A-Za-z]/.test(ch))//English
                {
                    contact.s = ch.toLowerCase();
                }
                else
                {
                    contact.s = this.reddah.getSortLetter(ch,'zh');
                }
            }
                        
            this.groupContacts(contacts);
            
        });  
    }

    groupContacts(contacts){

        this.contacts = [];
        this.groupedContacts = [];

        let sortedContacts = contacts.sort((a,b)=> a.s-b.s);
        let currentLetter = false;
        let currentContacts = [];

        sortedContacts.forEach((value, index, alias) => {
            if(value.s.charAt(0) != currentLetter){
                currentLetter = value.s.charAt(0);
                let newGroup = {
                    letter: currentLetter,
                    contacts: []
                };
                currentContacts = newGroup.contacts;
                this.groupedContacts.push(newGroup);
            } 
            currentContacts.push(value);
        });
    }

    async goChooseGroupChat(){
        const modal = await this.modalController.create({
            component: ChatChooseGroupPage
        });
        await modal.present();
    }
}
