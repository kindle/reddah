import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { ChatFirePage } from '../../chatfire/chat-fire.page';
import { GroupChatFirePage } from '../../chatfire/group-chat-fire.page';
import { ChatChooseGroupPage } from '../chat-choose-group/chat-choose-group.page';
import { Capacitor } from '@capacitor/core';

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
        //console.log(this.groupedContacts)

        let targetUsers = [];
        this.groupedContacts.forEach((item)=>{
            item.contacts.forEach((contact)=>{
                if(contact.isChecked==true)
                {
                    targetUsers.push(contact);
                }
            });
        });

        if(targetUsers.length==0){//no people selected
            this.submitClicked= false;
        }
        else if(targetUsers.length==1){//2 people chat
            this.close();
            const modal = await this.modalController.create({
                //component: ChatPage,
                component: ChatFirePage,
                componentProps: { 
                    title: this.reddah.appData('usernotename_'+targetUsers[0].Watch+'_'+this.userName),
                    target: targetUsers[0].Watch,
                },
                cssClass: "modal-fullscreen",
            });
            await modal.present();
            const {data} = await modal.onDidDismiss();
        }
        else//real group chat
        {
            this.close();
            const modal = await this.modalController.create({
                //component: GroupChatPage,
                component: GroupChatFirePage,
                componentProps: {
                    targetUsers: targetUsers,
                },
                cssClass: "modal-fullscreen",
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
                    this.localStorageService.store("userphoto_"+contact.Watch, Capacitor.convertFileSrc(cachedUserPhotoPath));
                }
                
                if(contact.UserPhoto!=null){
                    this.reddah.toImageCache(contact.UserPhoto, `userphoto_${contact.Watch}`);
                }

                let cname = contact.NoteName ? contact.NoteName : contact.Watch;
                let ch = cname.charAt(0);
                //console.log(ch)
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

        let sortedContacts = contacts.sort((a,b)=> 
        {
            var nameA = a.s.toUpperCase(); 
            var nameB = b.s.toUpperCase(); 
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            return 0;
        });
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
            component: ChatChooseGroupPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }
}
