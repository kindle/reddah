import { Component, OnInit, Input, ViewChild, NgZone } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { LocalePage } from '../../common/locale/locale.page';
import { SettingFontPage } from '../setting-font/setting-font.page';

@Component({
    selector: 'app-setting-ge',
    templateUrl: './setting-ge.page.html',
    styleUrls: ['./setting-ge.page.scss'],
})
export class SettingGePage implements OnInit {

    userName;
    locale;
    @Input() currentLocale;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public authService: AuthService,
        private zone: NgZone,
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
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
    }

    currentLocaleInfo;
    async changeLocale(){
        const changeLocaleModal = await this.modalController.create({
            component: LocalePage,
            componentProps: { orgLocale: this.currentLocale },
            cssClass: "modal-fullscreen",
        });
        
        await changeLocaleModal.present();
        const { data } = await changeLocaleModal.onDidDismiss();
        if(data){
            let newLocale = this.localStorageService.retrieve("Reddah_Locale");
            this.reddah.loadTranslate(newLocale);
            
            this.reddah.Locales.forEach((value, index, arr)=>{
                if(newLocale===value.Name)
                    this.currentLocaleInfo = value.Description;
            });
            this.currentLocale = newLocale;
        }
    }

    async clearCache(){
        this.cacheService.clearAll();
        //clear article block _options
        this.localStorageService.store("reddah_articles_"+this.userName, JSON.stringify([]));
        this.localStorageService.store("reddah_article_ids_"+this.userName, JSON.stringify([]));
        this.localStorageService.store("reddah_article_groups_"+this.userName, JSON.stringify([]));
        this.localStorageService.store("reddah_article_usernames_"+this.userName, JSON.stringify([]));
        this.cacheService.clearGroup("HomePage");
        //clear pub history
        this.localStorageService.clear("Reddah_Recent_3_"+this.userName);
        //clear mini history
        this.localStorageService.clear("Reddah_Recent_4_"+this.userName);
        //this.localStorageService.clear(); //this will force logout
        this.reddah.toast(this.reddah.instant("Common.CacheClear"));
    }

}
