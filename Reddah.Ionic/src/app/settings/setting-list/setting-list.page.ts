import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { SettingAboutPage } from '../setting-about/setting-about.page';
import { SettingAccountPage } from '../setting-account/setting-account.page';
import { SettingGePage } from '../setting-ge/setting-ge.page';
import { SettingPrivacyPage } from '../setting-privacy/setting-privacy.page';

@Component({
    selector: 'app-setting-list',
    templateUrl: './setting-list.page.html',
    styleUrls: ['./setting-list.page.scss'],
})
export class SettingListPage implements OnInit {

    userName;
    locale;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public authService: AuthService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }


    ngOnInit() {

    }
    
    async close() {
        await this.modalController.dismiss();
    }

    logout() {
        this.authService.logout();
    }

    async goAbout(){
        const modal = await this.modalController.create({
            component: SettingAboutPage,
        });
        
        await modal.present();
    }

    async goAccount(){
        const modal = await this.modalController.create({
            component: SettingAccountPage,
        });
        
        await modal.present();
    }

    async goPrivacy(){
        const modal = await this.modalController.create({
            component: SettingPrivacyPage,
        });
        
        await modal.present();
    }

    async goGeneral(){
        const modal = await this.modalController.create({
            component: SettingGePage,
        });
        
        await modal.present();
    }

}
