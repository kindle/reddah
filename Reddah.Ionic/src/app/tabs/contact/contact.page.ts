import { Component,ViewChild } from '@angular/core';
import { ModalController, PopoverController, Content } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { NewFriendPage } from '../../friend/new-friend/new-friend.page';
import { ReddahService } from '../../reddah.service';
import { CacheService } from 'ionic-cache';
import { UserPage } from '../../common/user/user.page';
import { ChangeNoteNamePopPage } from '../../common/change-notename-pop.page';
import { ChatChooseGroupPage } from '../../chat/chat-choose-group/chat-choose-group.page';

@Component({
    selector: 'app-contact',
    templateUrl: 'contact.page.html',
    styleUrls: ['contact.page.scss']
})
export class ContactPage {

    requestCount: number;

    contacts=[];
    groupedContacts = [];
    userName;

    @ViewChild('pageTop') pageTop: Content;

    constructor(
        public reddah: ReddahService,
        public localStorageService: LocalStorageService,
        public modalController: ModalController,
        public navController: NavController,
        public router: Router,
        private cacheService: CacheService,
        private popoverController: PopoverController,
        )
    {
        this.userName = this.reddah.getCurrentUser();
        let cachedGroupContact = this.localStorageService.retrieve("Reddah_GroupedContacts");
        if(cachedGroupContact){
            this.groupedContacts = JSON.parse(cachedGroupContact);
        }
        
        this.loadData(null);
        this.loadRequests();

    }

    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("ContactPage");
        this.localStorageService.clear("Reddah_GroupedContacts");
        this.localStorageService.clear("Reddah_Contacts");
        this.contacts = [];
        this.groupedContacts = [];
        this.loadData(event);
    }

    async loadRequests(){
        let formData = new FormData();
        let friendRequestList = [];
        this.reddah.friendRequests(formData)
        .subscribe(friendRequests => 
        {
            for(let friendRequest of friendRequests){
                friendRequestList.push(friendRequest);
            }
            this.requestCount=friendRequestList.filter(a=>a.Approve!=1).length;
        });
    }

    loadData(event){
        let cachedGroupContact = this.localStorageService.retrieve("Reddah_GroupedContacts");
        let cachedContact = this.localStorageService.retrieve("Reddah_Contacts");
        if(!cachedGroupContact||!cachedContact)
        {
            //this.showLoading = true;
        }

        let cacheKey = "this.reddah.getFriends";
        let request = this.reddah.getFriends();

        this.cacheService.loadFromObservable(cacheKey, request, "ContactPage")
        .subscribe(contacts => 
        {
            let cachedGroupContact = this.localStorageService.retrieve("Reddah_GroupedContacts");
            let cachedContact = this.localStorageService.retrieve("Reddah_Contacts");

            if(cachedContact!=JSON.stringify(contacts)||!cachedGroupContact){
                this.localStorageService.store("Reddah_Contacts", JSON.stringify(contacts));

                for(let contact of contacts){
                    //cache user image
                    this.reddah.getUserPhotos(contact.Watch);
                    let cname = this.reddah.getDisplayName(contact.Watch);
                    let ch = cname.charAt(0);
                    
                    if(/^[A-Za-z]/.test(ch))//English
                        contact.s = ch.toLowerCase();
                    else
                        contact.s = this.reddah.getSortLetter(ch,'zh');
                }
                
                this.groupContacts(contacts);
                this.localStorageService.store("Reddah_GroupedContacts", JSON.stringify(this.groupedContacts));
                this.localStorageService.store("Reddah_Contacts", JSON.stringify(contacts));
            }
            
            if(event)
                event.target.complete();
            
        });  
    }

    groupContacts(contacts){

        this.contacts = [];
        this.groupedContacts = [];

        let sortedContacts = contacts.sort((a,b)=> a.s.localeCompare(b.s));
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

    async viewNewFriends(){
        const newFriendModal = await this.modalController.create({
            component: NewFriendPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
            
        await newFriendModal.present();
        const { data } = await newFriendModal.onDidDismiss();
        if(data||!data)
        {
            this.cacheService.clearGroup("ContactPage");
            this.reddah.getUserPhotos(this.userName);
            this.loadRequests();
            this.loadData(null);
        }
    }

    async goChooseGroupChat(){
        const modal = await this.modalController.create({
            component: ChatChooseGroupPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }

    async goUser(userName){
        const modal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data||!data)
        {
            this.cacheService.clearGroup("ContactPage");
            this.reddah.getUserPhotos(this.userName);
            this.loadRequests();
            this.loadData(null);
        }
    }

    async showChangeMenu(event, contact){
        const popover = await this.popoverController.create({
            component: ChangeNoteNamePopPage,
            componentProps: { 
                targetUserName: contact.Watch,
                currentNoteName: contact.NoteName ? contact.NoteName : contact.Watch,   
            },
            event: event,
            animated: false,
            translucent: true,
            cssClass: 'change-note-label-popover'
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data||!data)
        {
            this.cacheService.clearGroup("ContactPage");
            this.reddah.getUserPhotos(this.userName);
            this.loadRequests();
            this.loadData(null);
        }
    }
}
