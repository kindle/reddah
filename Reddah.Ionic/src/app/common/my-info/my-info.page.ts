import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SettingSignaturePage } from '../../settings/setting-signature/setting-signature.page'
import { CacheService } from "ionic-cache";
import { ChangePhotoPage } from '../change-photo/change-photo.page';
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../../reddah.service';
import { QrcardPage } from '../qrcard/qrcard.page';
import { SettingNickNamePage } from '../../settings/setting-nickname/setting-nickname.page'
import { SettingSexPage } from '../../settings/setting-sex/setting-sex.page'
import { LocationPage } from '../location/location.page';

@Component({
    selector: 'app-my-info',
    templateUrl: './my-info.page.html',
    styleUrls: ['./my-info.page.scss'],
})
export class MyInfoPage implements OnInit {

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
    }

    userName: string;

    async ngOnInit() {
        this.reddah.getUserPhotos(this.userName);
    }

    async close() {
        await this.modalController.dismiss(this.changed);
    }

    changed : false;
    async changePhoto(){
        const userModal = await this.modalController.create({
          component: ChangePhotoPage,
          componentProps: { 
              title: "更换头像",
              tag : "portrait"
          }
        });
          
        await userModal.present();
        const { data } = await userModal.onDidDismiss();
        if(data)
        {
            this.reddah.getUserPhotos(this.userName);
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
                title: "设置昵称",
                currentNickName: this.reddah.appData('usernickname_'+this.userName)
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data||!data)
            this.reddah.getUserPhotos(this.userName);
    }

    async changeSignature(){
        const modal = await this.modalController.create({
            component: SettingSignaturePage,
            componentProps: {
                title: "设置个性签名",
                currentSignature: this.reddah.appData('usersignature_'+this.userName)
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data||!data)
            this.reddah.getUserPhotos(this.userName);
    }

    async changeLocation(){
        const modal = await this.modalController.create({
            component: LocationPage
        });
    
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.reddah.saveUserLocation(this.userName, data, data.location.lat, data.location.lng);
        }
    }

    async changeSex(){
        let currentValue = this.reddah.appData('usersex_'+this.userName);
        if(currentValue instanceof Number)
        {}    
        else
        {
            currentValue = 1;
        }

        const modal = await this.modalController.create({
            component: SettingSexPage,
            componentProps: {
                title: "设置性别",
                currentSex: currentValue
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data||!data)
            this.reddah.getUserPhotos(this.userName);
    }

}
