import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { ShareChooseGroupPage } from '../share-choose-group/share-choose-group.page';

@Component({
    selector: 'app-share-choose-user',
    templateUrl: './share-choose-user.page.html',
    styleUrls: ['./share-choose-user.page.scss'],
})
export class ShareChooseUserPage implements OnInit {

    @Input() targetUser;
    @Input() article: any;
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

        if(targetUsers.length==1){//2 people chat
            let formData = new FormData();
            formData.append("targetUser", targetUsers[0].Watch);
            formData.append("id", JSON.stringify(0));
            formData.append("limit", JSON.stringify(1));
            this.reddah.getChat(formData).subscribe(data=>{
                if(data.Success==0)
                {
                    let chatId = data.Message.Seed;
                    this.shareToFriend(chatId);
                }
                else{
                    alert(data);
                }
            });
        }
        else//real group chat
        {
            let formData = new FormData();
            formData.append("targetUsers", JSON.stringify(targetUsers.map(t=>t.Watch)));
            this.reddah.createGroupChat(formData).subscribe(data=>{
                if(data.Success==0)
                {
                    let groupChatId = data.Message.Id;
                    this.shareToFriend(groupChatId);
                }
                else{
                    alert(JSON.stringify(data));
                }
            });
        }
    }

    private shareToFriend(articleId){
        let selectedArticleId = articleId;
        let formData = new FormData();
        formData.append("abstract", this.reddah.htmlDecode(this.article.Title));
        formData.append("content", this.article.ImageUrl);
        formData.append("ref", JSON.stringify(this.article.Id));
        formData.append("chatid", JSON.stringify(selectedArticleId));

        this.reddah.shareToFriend(formData)
        .subscribe(result => 
        {
            if(result.Success==0)
            { 
                this.modalController.dismiss(true);
            }
            else{
                alert(result.Message);
            }
        });
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
                    this.localStorageService.store("userphoto_"+contact.Watch, (<any>window).Ionic.WebView.convertFileSrc(cachedUserPhotoPath));
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
            component: ShareChooseGroupPage,
            componentProps: {
                article: this.article,
            },
            cssClass: "modal-fullscreen",
        });
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data)
            this.modalController.dismiss(true);
    }
}
