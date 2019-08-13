import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController, Content } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { GroupChatPage } from '../group-chat.page';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { ChatChooseUserPage } from '../../chat/chat-choose-user/chat-choose-user.page';

@Component({
    selector: 'app-share-choose-group',
    templateUrl: './share-choose-group.page.html',
    styleUrls: ['./share-choose-group.page.scss'],
})
export class ShareChooseGroupPage implements OnInit {

    @ViewChild('pageTop') pageTop: Content;

    @Input() article: any;
    
    async close() {
        await this.modalController.dismiss();
    }

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private cacheService: CacheService,
        public authService: AuthService,
    ) {}

    ngOnInit() {
        this.getGroupList();
    }

    //drag down
    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("ChatChooseGroupPage");
        this.groupList = [];
        this.getGroupList(event);
    }

    groupList = [];

    getGroupList(event=null){
        let cacheKey = "this.reddah.getGroupList";
        let formData = new FormData();
        let request = this.reddah.getGroupList(formData);

        this.cacheService.loadFromObservable(cacheKey, request, "ChatChooseGroupPage")
        .subscribe(result => 
        {
            if(result.Success==0){
                this.groupList = result.Message;
                result.Message.forEach((item)=>{
                    item.GroupName.split(",").forEach((userName)=>{
                        this.reddah.getUserPhotos(userName);
                    });
                });
            }
            if(event)
                event.target.complete();
        });  
    }

    async goGroupChat(groupChat){
        /*const modal = await this.modalController.create({
            component: GroupChatPage,
            componentProps: {
                groupChat: groupChat,
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data=='delete'){
            this.clearCacheAndReload(null);
        }*/

        let selectedArticleId = groupChat.Id;
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


}
