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
    @Input() delete;

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
        if(this.delete)
            this.loadData_delete();
        else{
            this.loadData();
        }
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
                if(contact.isChecked==true)
                {
                    targetUsers.push(contact.Watch);
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

    loadData_delete(){
        let cachedGroupContact = this.localStorageService.retrieve("Reddah_GroupedContacts");
        if(cachedGroupContact){
            this.groupedContacts = JSON.parse(cachedGroupContact);
            this.groupedContacts.forEach((item)=>{
                item.contacts = item.contacts.filter(c=>this.addedUsers.split(',').includes(c.Watch));
            });
            this.groupedContacts = this.groupedContacts.filter(g=>g.contacts.length>0);
        } 
    }

    async submit_delete(){
        this.submitClicked= true;

        let targetUsers = this.addedUsers.split(',');
        //alert(JSON.stringify(targetUsers))
        this.groupedContacts.forEach((item)=>{
            item.contacts.forEach((contact)=>{
                if(contact.isChecked==true)
                {
                    targetUsers = targetUsers.filter(t=>t!=contact.Watch);
                }
            });
        });
        //alert(JSON.stringify(targetUsers.filter(t=>t!="")))
        this.modalController.dismiss(targetUsers.filter(t=>t!=""));
    }

}
