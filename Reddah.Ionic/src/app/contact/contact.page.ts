import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { NewFriendPage } from '../new-friend/new-friend.page';
import { StatusBar } from '@ionic-native/status-bar';
import { ReddahService } from '../reddah.service';
import { CacheService } from 'ionic-cache';

@Component({
    selector: 'app-contact',
    templateUrl: 'contact.page.html',
    styleUrls: ['contact.page.scss']
})
export class ContactPage {

    requestCount: number;

    contacts;
    groupedContacts = [];

    constructor(
        public reddah: ReddahService,
        public localStorageService: LocalStorageService,
        public modalController: ModalController,
        public navController: NavController,
        public router: Router,
        private cacheService: CacheService,
        )
    {
        this.requestCount=2;

        let cacheKey = "this.reddah.getFriends";
        let request = this.reddah.getFriends();

        this.cacheService.loadFromObservable(cacheKey, request, "ContactPage")
        .subscribe(contacts => 
        {
            this.groupContacts(contacts);
        });        
    }

    groupContacts(contacts){

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
            componentProps: {  }
        });
            
        await newFriendModal.present();
    }

}
