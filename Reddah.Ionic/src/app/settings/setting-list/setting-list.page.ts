import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { SettingAboutPage } from '../setting-about/setting-about.page';
import { SettingAccountPage } from '../setting-account/setting-account.page';
import { SettingGePage } from '../setting-ge/setting-ge.page';
import { SettingPrivacyPage } from '../setting-privacy/setting-privacy.page';
import { TranslateService } from '@ngx-translate/core';
import { AddFeedbackPage } from '../../mytimeline/add-feedback/add-feedback.page';

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
        private alertController: AlertController,
        private translate: TranslateService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }


    ngOnInit() {

    }
    
    async close() {
        await this.modalController.dismiss();
    }

    async logout() {
        const alert = await this.alertController.create({
            header: this.translate.instant("Confirm.Title"),
            message: this.translate.instant("Confirm.LogoutMessage"),
            buttons: [
            {
                text: this.translate.instant("Confirm.Cancel"),
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {}
            }, 
            {
                text: this.translate.instant("Confirm.Yes"),
                handler: () => {
                    this.authService.logout();
                }
            }]
        });

        await alert.present().then(()=>{});
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

    async feedback() {
        const modal = await this.modalController.create({
            component: AddFeedbackPage,
        });
          
        await modal.present();
    }

}
