import { Component } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { AddFriendPage } from '../friend/add-friend/add-friend.page';
import { ChatChooseUserPage } from '../chat/chat-choose-user/chat-choose-user.page';

@Component({
    template: `
        <div (click)="close()">
            <ion-item button (click)="createGroupChat()">
                <ion-icon slot="start" color="tertiary" name="ios-chatbubbles"></ion-icon>  
                <ion-label>发起群聊</ion-label>
            </ion-item>
            <ion-item button (click)="addFriend()">
                <ion-icon slot="start" color="tertiary" name="ios-person-add"></ion-icon>  
                <ion-label>添加朋友</ion-label>
            </ion-item>
            <ion-item button href="/scan">
                <ion-icon slot="start" color="tertiary" name="ios-qr-scanner"></ion-icon>  
                <ion-label>扫一扫</ion-label>
            </ion-item>
            <ion-item button href="https://reddah.com/{{locale}}/r/feedbacks">
                <ion-icon slot="start" color="tertiary" name="ios-help-circle-outline"></ion-icon>  
                <ion-label>帮助与反馈</ion-label>
            </ion-item>
        </div>
    `
})
export class HeaderAddPage {
    locale;
    constructor(
        public popoverCtrl: PopoverController,
        public reddah: ReddahService,
        private modalController: ModalController,
        ) {
        this.locale = this.reddah.getCurrentLocale();
    }

    support() {
        // this.app.getRootNavs()[0].push('/support');
        this.popoverCtrl.dismiss();
    }

    close() {
        this.popoverCtrl.dismiss();
    }

    async addFriend(){
        const addFriendModal = await this.modalController.create({
            component: AddFriendPage,
        });
          
        await addFriendModal.present();
    }

    async createGroupChat(){
        const modal = await this.modalController.create({
            component: ChatChooseUserPage,
        });
          
        await modal.present();
    }
}
