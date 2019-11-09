import { Component, OnInit, Input, ViewChild, NgZone } from '@angular/core';
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
    @Input() currentLocale;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public authService: AuthService,
        private translate: TranslateService,
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
            this.zone.run(()=>{
                let newLocale = this.localStorageService.retrieve("Reddah_Locale");
                this.translate.setDefaultLang(newLocale);
                
                this.reddah.Locales.forEach((value, index, arr)=>{
                    if(newLocale===value.Name)
                        this.currentLocaleInfo = value.Description;
                });
            })
        }
    }

    async clearCache(){
        this.cacheService.clearAll();
        //clear article block _options
        this.localStorageService.store("reddah_articles", JSON.stringify([]));
        this.localStorageService.store("reddah_article_ids", JSON.stringify([]));
        this.localStorageService.store("reddah_article_groups", JSON.stringify([]));
        this.localStorageService.store("reddah_article_usernames", JSON.stringify([]));
        this.cacheService.clearGroup("HomePage");
        //clear pub history
        this.localStorageService.clear(`Reddah_Recent_3`);
        //clear mini history
        this.localStorageService.clear(`Reddah_Recent_4`);
        //this.localStorageService.clear(); //this will force logout
        this.reddah.toast(this.translate.instant("Common.CacheClear"));
    }

}
