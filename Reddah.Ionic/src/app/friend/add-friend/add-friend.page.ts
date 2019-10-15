import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { QrcardPage } from '../../common/qrcard/qrcard.page';
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../../reddah.service';
import { SearchUserPage } from '../search-user/search-user.page'

@Component({
    selector: 'app-add-friend',
    templateUrl: './add-friend.page.html',
    styleUrls: ['./add-friend.page.scss'],
})
export class AddFriendPage implements OnInit {

    userName;

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService
    ) { 
        this.userName = this.reddah.getCurrentUser();
    }

    ngOnInit() {
        
    }

    async close() {
        await this.modalController.dismiss(false);
    }

    async searchUser(){
        const modal = await this.modalController.create({
            component: SearchUserPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    async myQrCard(){
        const modal = await this.modalController.create({
            component: QrcardPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
    }

}
