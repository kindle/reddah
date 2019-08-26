import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { SettingChangePasswordPage } from '../setting-change-password/setting-change-password.page';

@Component({
    selector: 'app-setting-account',
    templateUrl: './setting-account.page.html',
    styleUrls: ['./setting-account.page.scss'],
})
export class SettingAccountPage implements OnInit {

    userName;
    locale;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public authService: AuthService,
        private toastController: ToastController,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }


    ngOnInit() {
    }
    
    async close() {
        await this.modalController.dismiss();
    }

    async goEmail() {
        
    }

    async changePassword(){
        const modal = await this.modalController.create({
            component: SettingChangePasswordPage,
        });
        
        await modal.present();

    }

    async goSafeCenter(){
        
    }

    

}
