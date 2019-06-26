import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-choose-user',
    templateUrl: './choose-user.page.html',
    styleUrls: ['./choose-user.page.scss'],
})
export class ChooseUserPage implements OnInit {

    @Input() targetUser;
    @Input() addedUsers;

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

        let targetUsers = [];
        this.groupedContacts.forEach((item)=>{
            item.contacts.forEach((contact)=>{
                if(contact.isChecked==true&&!this.addedUsers.split(',').includes(contact.Watch))
                {
                    targetUsers.push(contact);
                }
            });
        });

        this.modalController.dismiss(targetUsers);
    }

    contacts=[];
    groupedContacts = [];

    loadData(){
        let cachedGroupContact = this.localStorageService.retrieve("Reddah_GroupedContacts");
        if(cachedGroupContact){
            this.groupedContacts = JSON.parse(cachedGroupContact);
            this.groupedContacts.forEach((item)=>{
                item.contacts.forEach((contact)=>{
                    if(this.addedUsers.split(',').includes(contact.Watch))
                    {
                        contact.isChecked=true;
                    }
                });
            });
        } 
    }

}
