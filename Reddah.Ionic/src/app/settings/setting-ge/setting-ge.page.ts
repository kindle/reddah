import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { LocalePage } from '../../common/locale/locale.page';
import { TranslateService } from '@ngx-translate/core';
import { SettingFontPage } from '../setting-font/setting-font.page';

@Component({
    selector: 'app-setting-ge',
    templateUrl: './setting-ge.page.html',
    styleUrls: ['./setting-ge.page.scss'],
})
export class SettingGePage implements OnInit {

    userName;
    locale;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public authService: AuthService,
        private translate: TranslateService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }


    ngOnInit() {
        this.currentLocaleInfo = "Not Set";
        const locale = this.localStorageService.retrieve("Reddah_Locale");
        this.reddah.Locales.forEach((value, index, arr)=>{
            if(locale===value.Name)
                this.currentLocaleInfo = value.Description;
        });
    }
    
    async close() {
        await this.modalController.dismiss();
    }

    logout() {
        this.authService.logout();
    }

    async goFontSize(){
        const modal = await this.modalController.create({
            component: SettingFontPage,
        });
        
        await modal.present();
    }

    currentLocaleInfo;
    async changeLocale(){
        let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
        const changeLocaleModal = await this.modalController.create({
            component: LocalePage,
            componentProps: { orgLocale: currentLocale }
        });
        
        await changeLocaleModal.present();
        const { data } = await changeLocaleModal.onDidDismiss();
        if(data){
            //let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
            //this.translate.setDefaultLang(currentLocale);
            window.location.reload();
        }

    }

    async clearCache(){
        this.cacheService.clearAll();
        //this.localStorageService.clear(); //this will force logout
        this.reddah.toast(this.translate.instant("Common.CacheClear"));
    }

}
