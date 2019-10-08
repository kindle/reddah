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
import { TranslateService } from '@ngx-translate/core';

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
        private translate: TranslateService,
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
              title: this.translate.instant("About.Photo"),
              tag : "portrait",
              targetUserName: ""
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
                title: this.translate.instant("About.Nickname"),
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
                title: this.translate.instant("About.Signature"),
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
                title: this.translate.instant("About.Sex"),
                currentSex: currentValue
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data||!data)
            this.reddah.getUserPhotos(this.userName);
    }

}
