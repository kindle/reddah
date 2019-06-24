import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SettingSignaturePage } from '../../settings/setting-signature/setting-signature.page'
import { CacheService } from "ionic-cache";
import { ChangePhotoPage } from '../change-photo/change-photo.page';
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../../reddah.service';
import { QrcardPage } from '../qrcard/qrcard.page';
import { SettingNickNamePage } from '../../settings/setting-nickname/setting-nickname.page'

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
    /*photo: string = "assets/icon/anonymous.png";
    formData: FormData;
    
    nickName: string;
    sex: number;
    location: string;
    signature: string;
    cover: string;

    noteName: string;
    isFriend = -1;*/

    async ngOnInit() {
        this.reddah.getUserPhotos(this.userName);
    }

    /*getUserInfo(){
        this.formData = new FormData();
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getUserInfo"+this.userName;
        console.log(`cacheKey:${cacheKey}`);
        let request = this.reddah.getUserInfo(this.formData);

        this.cacheService.loadFromObservable(cacheKey, request, "TimeLinePage"+this.userName)
            .subscribe(userInfo => 
            {
                console.log(JSON.stringify(userInfo));
                this.nickName = userInfo.NickName
                this.sex = userInfo.Sex;
                if(userInfo.Photo!=null)
                    this.photo = userInfo.Photo;
                this.location = userInfo.Location;
                this.signature = userInfo.Signature;
                this.cover = userInfo.Cover;

                this.noteName = userInfo.NoteName;
            }
        );
    }*/


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
                currentSignature: this.reddah.appData('usersignature_'+this.userName)
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data||!data)
            this.reddah.getUserPhotos(this.userName);
    }

}
