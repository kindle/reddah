import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppUpdate } from '@ionic-native/app-update/ngx';
import { Platform } from '@ionic/angular'; 
import { AddFeedbackPage } from '../../mytimeline/add-feedback/add-feedback.page';

@Component({
    selector: 'app-setting-about',
    templateUrl: './setting-about.page.html',
    styleUrls: ['./setting-about.page.scss'],
})
export class SettingAboutPage implements OnInit {

    userName;
    locale;
    version;

    constructor(
        private appVersion: AppVersion,
        private appUpdate: AppUpdate,
        private platform: Platform,
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public authService: AuthService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
        
    }

    getVersionNumber(): Promise<string> {
        return new Promise((resolve) => {
            this.appVersion.getVersionNumber().then((value: string) => {
                resolve(value);
            }).catch(err => {
                alert(err);
            });
        });
    }

    ngOnInit() {
        this.getVersionNumber().then(version => {
            this.version = version;
        });

        //upgrade auto when come in
        this.upgrade();
    }

    upgradeChecked = false;
    upgrade() {
        this.upgradeChecked = true;
        const updateUrl = 'https://reddah.com/apk/update.xml';
        if (this.isMobile()) {
            this.getVersionNumber().then(version => {
                if (this.isAndroid()) {
                    this.appUpdate.checkAppUpdate(updateUrl).then(data => {});
                } else {
                    this.appUpgrade();
                }
            });
                
        }
    }


    appUpgrade() {
        alert('appupgrade');
        /*this.alertCtrl.create({
            title: '发现新版本',
            subTitle: '检查到新版本，是否立即下载？',
            buttons: [{ text:'取消' },
            {
                text: '下载'
                handler: () => {
                        //跳转ios 版本下载地址
                        this.iab.create(url, '_system');
                }
            }
            ]
        }).present();*/
    }

    isMobile(): boolean {
        return this.platform.is('mobile');
    }

    isAndroid(): boolean {
        return this.isMobile() && this.platform.is('android');
    }

    isIos(): boolean {
        return this.isMobile() && (this.platform.is('ios') || this.platform.is('ipad') || this.platform.is('iphone'));
    }
    
    async close() {
        await this.modalController.dismiss();
    }

    logout() {
        this.authService.logout();
    }

    async feedback() {
        const modal = await this.modalController.create({
            component: AddFeedbackPage,
        });
          
        await modal.present();
    }

}
