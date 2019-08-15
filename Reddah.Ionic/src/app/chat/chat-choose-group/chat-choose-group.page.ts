import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController, Content } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { GroupChatPage } from '../group-chat.page';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { ChatChooseUserPage } from '../../chat/chat-choose-user/chat-choose-user.page';

@Component({
    selector: 'app-chat-choose-group',
    templateUrl: './chat-choose-group.page.html',
    styleUrls: ['./chat-choose-group.page.scss'],
})
export class ChatChooseGroupPage implements OnInit {

    @ViewChild('pageTop') pageTop: Content;
    
    async close() {
        await this.modalController.dismiss();
    }

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private cacheService: CacheService,
        public authService: AuthService,
    ) {}

    ngOnInit() {}

    ionViewDidEnter(){
        this.getGroupList();
    }

    //drag down
    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    async clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("ChatChooseGroupPage");
        this.groupList = [];
        await this.getGroupList(event);
    }

    groupList = [];

    async getGroupList(event=null){
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
        const modal = await this.modalController.create({
            component: GroupChatPage,
            componentProps: {
                groupChat: groupChat,
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data=='delete'){
            this.clearCacheAndReload(null);
        }
    }

    async createGroupChat(){
        const modal = await this.modalController.create({
            component: ChatChooseUserPage,
        });
          
        await modal.present();
    } 

}
