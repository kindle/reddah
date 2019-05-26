import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { NewFriendPage } from '../../friend/new-friend/new-friend.page';
import { StatusBar } from '@ionic-native/status-bar';
import { ReddahService } from '../../reddah.service';
import { CacheService } from 'ionic-cache';
import { UserPage } from '../../user/user.page';

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
        )
    {
        this.userName = this.reddah.getCurrentUser();
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
            }

            this.groupContacts(contacts);
        });  
    }

    groupContacts(contacts){

        this.contacts = [];
        this.groupedContacts = [];

        let sortedContacts = contacts.sort((a,b)=> a.NoteName-b.NoteName);
        let currentLetter = false;
        let currentContacts = [];

        sortedContacts.forEach((value, index) => {

            let name = value.NoteName ? value.NoteName : value.UserName;
            if(name.charAt(0) != currentLetter){

                currentLetter = name.charAt(0);

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
            this.loadRequests();
            this.loadData();
        }
    }

    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            }
        });
          
        await userModal.present();
        const { data } = await userModal.onDidDismiss();
        if(data||!data)
        {
            this.cacheService.clearGroup("ContactPage");
            this.loadRequests();
            this.loadData();
        }
    }

    foo(){}

}
