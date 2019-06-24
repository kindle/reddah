import { Component } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { NewFriendPage } from '../../friend/new-friend/new-friend.page';
import { StatusBar } from '@ionic-native/status-bar';
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
            console.log('use cache grouped contact')
            this.groupedContacts = JSON.parse(cachedGroupContact);
        }
        
        this.loadData();
        this.loadRequests();

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

    loadData(){
        let cacheKey = "this.reddah.getFriends";
        let request = this.reddah.getFriends();

        this.cacheService.loadFromObservable(cacheKey, request, "ContactPage")
        .subscribe(contacts => 
        {
            let cachedContact = this.localStorageService.retrieve("Reddah_Contacts");

            if(cachedContact==JSON.stringify(contacts)){
                //
            }
            else{
                this.localStorageService.store("Reddah_Contacts", JSON.stringify(contacts));

                for(let contact of contacts){
                    //cache user image
                    this.reddah.CommonCache(contact.UserPhoto, `userphoto_${contact.Watch}`,"assets/icon/anonymous.png");
                    
                    let cname = contact.NoteName ? contact.NoteName : 
                        (contact.UserNickName ? contact.UserNickName : contact.Watch);
                    let ch = cname.charAt(0);
                    
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
                this.localStorageService.store("Reddah_GroupedContacts", JSON.stringify(this.groupedContacts));
            }
            
            
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
        });
            
        await newFriendModal.present();
        const { data } = await newFriendModal.onDidDismiss();
        if(data||!data)
        {
            this.cacheService.clearGroup("ContactPage");
            this.reddah.getUserPhotos(this.userName);
            this.loadRequests();
            this.loadData();
        }
    }

    async goChooseGroupChat(){
        const modal = await this.modalController.create({
            component: ChatChooseGroupPage
        });
        await modal.present();
    }

    async goUser(userName){
        const modal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            }
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data||!data)
        {
            this.cacheService.clearGroup("ContactPage");
            this.reddah.getUserPhotos(this.userName);
            this.loadRequests();
            this.loadData();
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
            this.loadData();
        }
    }
}
