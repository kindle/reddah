import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { GroupChatPage } from '../group-chat.page';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-chat-choose-group',
    templateUrl: './chat-choose-group.page.html',
    styleUrls: ['./chat-choose-group.page.scss'],
})
export class ChatChooseGroupPage implements OnInit {

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

    groupList = [];

    getGroupList(){
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
    }

}
