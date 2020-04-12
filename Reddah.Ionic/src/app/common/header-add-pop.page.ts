import { Component } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { AddFriendPage } from '../friend/add-friend/add-friend.page';
import { ChatChooseUserPage } from '../chat/chat-choose-user/chat-choose-user.page';
import { AddFeedbackPage } from '../mytimeline/add-feedback/add-feedback.page';

@Component({
    template: `
        <div (click)="close()">
            <ion-item button (click)="createGroupChat()">
                <ion-icon slot="start" style="margin-right:15px;" color="white" name="chatbubbles"></ion-icon>  
                <ion-label>{{ reddah.instant('Menu.Header.GroupChat') }}</ion-label>
            </ion-item>
            <ion-item button (click)="addFriend()">
                <ion-icon slot="start" style="margin-right:15px;" color="white" name="person-add"></ion-icon>  
                <ion-label>{{ reddah.instant('Menu.Header.AddFriend') }}</ion-label>
            </ion-item>
            <!--<ion-item button href="/scan">
                <ion-icon slot="start" style="margin-right:15px;" color="white" name="qr-scanner"></ion-icon>  
                <ion-label>{{ reddah.instant('Menu.Header.Scan') }}</ion-label>
            </ion-item>-->
            <ion-item button (click)="feedback()">
                <ion-icon slot="start" style="margin-right:15px;" color="white" name="mail"></ion-icon>  
                <ion-label>{{ reddah.instant('Menu.Header.Feedback') }}</ion-label>
            </ion-item>
        </div>
    `
})
export class HeaderAddPage {
    locale;
    constructor(
        public popoverCtrl: PopoverController,
        public reddah: ReddahService,
        private modalController: ModalController
        ) {
        this.locale = this.reddah.getCurrentLocale();
    }

    async feedback() {
        const modal = await this.modalController.create({
            component: AddFeedbackPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    close() {
        this.popoverCtrl.dismiss();
    }

    async addFriend(){
        const addFriendModal = await this.modalController.create({
            component: AddFriendPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
          
        await addFriendModal.present();
    }

    async createGroupChat(){
        const modal = await this.modalController.create({
            component: ChatChooseUserPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }
}
