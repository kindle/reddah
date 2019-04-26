import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { CacheService } from "ionic-cache";
import { ChangePhotoPage } from '../change-photo/change-photo.page';
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';


@Component({
  selector: 'app-my-info',
  templateUrl: './my-info.page.html',
  styleUrls: ['./my-info.page.scss'],
})
export class MyInfoPage implements OnInit {

    constructor(
        private modalController: ModalController,
        private reddahService: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
    ) { }

    photo: string = "assets/icon/anonymous.png";
    formData: FormData;
    userName: string;
    nickName: string;
    sex: number;
    location: string;
    signature: string;
    cover: string;

    noteName: string;
    isFriend = -1;

    async ngOnInit() {
        this.userName = this.reddahService.getCurrentUser();
        this.getUserInfo();
    }

    getUserInfo(){
        this.formData = new FormData();
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getUserInfo"+this.userName;
        console.log(`cacheKey:${cacheKey}`);
        let request = this.reddahService.getUserInfo(this.formData);

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
            this.getUserInfo();
        }
        this.changed = data;
    }

}
