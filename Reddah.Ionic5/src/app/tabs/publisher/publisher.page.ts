import { Component, ViewChild } from '@angular/core';
import { ModalController, PopoverController, IonContent } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { CacheService } from 'ionic-cache';
import { SearchPage } from '../../common/search/search.page';
import { PubPage } from './pub/pub.page';

@Component({
    selector: 'app-publisher',
    templateUrl: 'publisher.page.html',
    styleUrls: ['publisher.page.scss']
})
export class PublisherPage {

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
        let cachedGroupContact = this.localStorageService.retrieve("Reddah_GroupedContacts_Pub_"+this.userName);
        if(cachedGroupContact){
            this.groupedContacts = JSON.parse(cachedGroupContact);
        }
        
        this.loadData(null);

    }

    showLoading = false;
    loadData(event){
        let cachedGroupContact = this.localStorageService.retrieve("Reddah_GroupedContacts_Pub_"+this.userName);
        let cachedContact = this.localStorageService.retrieve("Reddah_Contacts_Pub_"+this.userName);
        if(!cachedGroupContact||!cachedContact)
        {
            this.showLoading = true;
        }

        let cacheKey = "this.reddah.getFocusPubs";
        let request = this.reddah.getFocusPubs();

        this.cacheService.loadFromObservable(cacheKey, request, "PubPage")
        .subscribe(pubs => 
        {
            let cachedGroupContact = this.localStorageService.retrieve("Reddah_GroupedContacts_Pub_"+this.userName);
            let cachedContact = this.localStorageService.retrieve("Reddah_Contacts_Pub_"+this.userName);

            if(cachedContact!=JSON.stringify(pubs)||!cachedGroupContact){
                this.localStorageService.store("Reddah_Contacts_Pub", JSON.stringify(pubs));
                
                for(let pub of pubs){
                    //cache user image
                    this.reddah.getUserPhotos(pub.UserName);
                    let cname = pub.UserNickName;
                    
                    let ch = cname.charAt(0);
                    
                    if(/^[A-Za-z]/.test(ch))//English
                        pub.s = ch.toLowerCase();
                    else
                        pub.s = this.reddah.getSortLetter(ch,'zh');
                }
                
                this.groupContacts(pubs);
                this.localStorageService.store("Reddah_GroupedContacts_Pub_"+this.userName, JSON.stringify(this.groupedContacts));
                this.localStorageService.store("Reddah_Contacts_Pub_"+this.userName, JSON.stringify(pubs));
            }
            
            this.showLoading = false;
            if(event){
                event.target.complete();
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

    async goSearch(){
        const userModal = await this.modalController.create({
            component: SearchPage,
            componentProps: {
                type: 2,//publisher only
            },
            cssClass: "modal-fullscreen",
        });
          
        await userModal.present();
    }

    async close(){
        await this.modalController.dismiss();
    }

    

    async goPub(userName){
        const modal = await this.modalController.create({
            component: PubPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data||!data)
        {
            this.loadData(null);
        }
    }

    //drag down
    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    @ViewChild('pageTop') pageTop: IonContent;
    
    clearCacheAndReload(event){
        //this.pageTop.scrollToTop();
        this.cacheService.clearGroup("PubPage");
        this.localStorageService.clear("Reddah_GroupedContacts_Pub_"+this.userName);
        this.localStorageService.clear("Reddah_Contacts_Pub_"+this.userName);
        this.contacts=[];
        this.groupedContacts = [];
        this.loadData(event);
    }

}
