import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { SettingChangePasswordPage } from '../setting-change-password/setting-change-password.page';
import { TranslateService } from '@ngx-translate/core';

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
        private translate: TranslateService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }


    ngOnInit() {
        this.reddah.getUserPhotos(this.userName);
    }
    
    async close() {
        await this.modalController.dismiss();
    }

    async goEmail() {
        
    }

    async changePassword(){
        const modal = await this.modalController.create({
            component: SettingChangePasswordPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();

    }

    async goSafeCenter(){
        
    }

    verifyFlag = false;
    async verifyEmail(){
        let formData = new FormData();
        formData.append("Locale", this.reddah.getCurrentLocale());
        formData.append("MailTitle", this.translate.instant("Mail.Register.Title"));
        formData.append("MailSub", this.translate.instant("Mail.Register.Sub"));
        formData.append("MailParaStart", this.translate.instant("Mail.Register.ParaStart"));
        formData.append("MailParaEnd", this.translate.instant("Mail.Register.ParaEnd"));
        this.reddah.sendVerfiyEmail(formData).subscribe(data=>{
            this.reddah.toast(this.translate.instant("Service.1005"), "primary");
        });

        this.verifyFlag = true;
    }

    async refreshVerify(){
        this.reddah.getUserPhotos(this.userName);
    }
    

}
