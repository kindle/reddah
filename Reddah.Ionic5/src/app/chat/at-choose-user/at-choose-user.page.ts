import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { Capacitor } from '@capacitor/core';

@Component({
    selector: 'app-at-choose-user',
    templateUrl: './at-choose-user.page.html',
    styleUrls: ['./at-choose-user.page.scss'],
})
export class AtChooseUserPage implements OnInit {

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

    
    
    async close(targetUsers=[]) {
        await this.modalController.dismiss(targetUsers);
    }

    
    submitClicked=false;
    async submit(){
        this.submitClicked= true;
        
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
        else
        {
            this.close(targetUsers);
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
                
                if(/^[A-Za-z]/.test(ch))//English
                {
                    contact.s = ch.toLowerCase();
                }
                else
                {
                    contact.s = this.reddah.getSortLetter(ch,'zh');
                }
            }
              
            this.contacts = contacts;
            this.groupContacts(this.contacts);
            
        });  
    }

    groupContacts(customContacts){
        this.groupedContacts = [];

        let sortedContacts = customContacts.sort((a,b)=> 
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
        console.log(sortedContacts)
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

    filterUsers(ev) {
        var val = ev.target.value;

        let filterContacts = this.contacts.filter((item) => {
            return (item.Watch.toLowerCase().indexOf(val.toLowerCase()) > -1)||
            (item.UserNickName!=null&&item.UserNickName.toLowerCase().indexOf(val.toLowerCase()) > -1)||
            (item.NoteName!=null&&item.NoteName.toLowerCase().indexOf(val.toLowerCase()) > -1)||
            (item.s.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })

        this.groupContacts(filterContacts);
    }
}
