import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SettingSignaturePage } from '../../../settings/setting-signature/setting-signature.page'
import { CacheService } from "ionic-cache";
import { ChangePhotoPage } from '../../../common/change-photo/change-photo.page';
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../../../reddah.service';
import { QrcardPage } from '../../../common/qrcard/qrcard.page';
import { SettingNickNamePage } from '../../../settings/setting-nickname/setting-nickname.page'

@Component({
    selector: 'app-sub-info',
    templateUrl: './sub-info.page.html',
    styleUrls: ['./sub-info.page.scss'],
})
export class SubInfoPage implements OnInit {

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
    }

    userName: string;
    @Input() targetUserName;

    async ngOnInit() {
        this.reddah.getUserPhotos(this.targetUserName);
    }

    async close() {
        await this.modalController.dismiss(this.changed);
    }

    changed : false;
    async changePhoto(){
        const userModal = await this.modalController.create({
          component: ChangePhotoPage,
          componentProps: { 
              title: "更换Logo",
              tag : "portrait",
              targetUserName: this.targetUserName
          }
        });
          
        await userModal.present();
        const { data } = await userModal.onDidDismiss();
        if(data)
        {
            this.reddah.getUserPhotos(this.targetUserName);
        }
        this.changed = data;
    }

    async myQrCard(){
        const qrModal = await this.modalController.create({
            component: QrcardPage
        });
        
        await qrModal.present();
    }

    async changeNickName(){
        const modal = await this.modalController.create({
            component: SettingNickNamePage,
            componentProps: { 
                title: "设置名称",
                currentNickName: this.reddah.appData('usernickname_'+this.targetUserName),
                targetUserName: this.targetUserName
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data){
            this.reddah.getUserPhotos(this.targetUserName);
        }
        this.changed = data;
    }

    async changeSignature(){
        const modal = await this.modalController.create({
            component: SettingSignaturePage,
            componentProps: { 
                title: "设置描述",
                currentSignature: this.reddah.appData('usersignature_'+this.targetUserName),
                targetUserName: this.targetUserName
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data){
            this.reddah.getUserPhotos(this.targetUserName);
        }
        this.changed = data;
    }

}
