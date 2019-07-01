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
                <ion-icon slot="start" color="tertiary" name="ios-chatbubbles"></ion-icon>  
                <ion-label>{{ 'Menu.Header.GroupChat' | translate }}</ion-label>
            </ion-item>
            <ion-item button (click)="addFriend()">
                <ion-icon slot="start" color="tertiary" name="ios-person-add"></ion-icon>  
                <ion-label>{{ 'Menu.Header.AddFriend' | translate }}</ion-label>
            </ion-item>
            <ion-item button href="/scan">
                <ion-icon slot="start" color="tertiary" name="ios-qr-scanner"></ion-icon>  
                <ion-label>{{ 'Menu.Header.Scan' | translate }}</ion-label>
            </ion-item>
            <ion-item button (click)="feedback()">
                <ion-icon slot="start" color="tertiary" name="ios-help-circle-outline"></ion-icon>  
                <ion-label>{{ 'Menu.Header.Feedback' | translate }}</ion-label>
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
        });
          
        await modal.present();
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
