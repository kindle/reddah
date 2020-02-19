import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { AppUpdate } from '@ionic-native/app-update/ngx';
import { Platform } from '@ionic/angular'; 
import { AlertController, ActionSheetController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

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
        private appUpdate: AppUpdate,
        private platform: Platform,
        private modalController: ModalController,
        public reddah: ReddahService,
        public authService: AuthService,
        private actionSheetController: ActionSheetController,
        private translate: TranslateService,
        private iab: InAppBrowser,
        private alertController: AlertController,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }

    ngOnInit() {
        if(this.platform.is('cordova')){
            this.reddah.getVersionNumber().then(version => {
                this.version = version;
            });
        }

        //upgrade auto when come in
        //this.upgrade();
    }

    upgradeChecked = false;
    upgrade() {
        this.upgradeChecked = true;
        const updateUrl = 'https://reddah.com/apk/update.xml';
        if (this.isMobile()) {
            this.reddah.getVersionNumber().then(version => {
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

    async like() {
        let iosId = 1481532281;
        let storeAppURL = "ms-windows-store://pdp/?productid=9NBLGGH0B2B9";
        if(this.platform.is('ios')){
            storeAppURL = `itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id=${iosId}&onlyLatestVersion=true&pageNumber=0&sortOrdering=1&type=Purple+Software`;
        }
        else if(this.platform.is('android')){
            storeAppURL = "market://details?id=com.reddah.app";
        }
        else{
            storeAppURL = `https://apps.apple.com/cn/app/id${iosId}?l=${this.reddah.getCurrentLocale()}`;
        }

        this.iab.create(storeAppURL, '_system');
    }

    async buymebeer(){
        if(this.platform.is('android'))
        {

        }
        if(this.platform.is('ios')){

        }

        const actionSheet = await this.actionSheetController.create({
            header: this.translate.instant("About.BuyBeer"),
            buttons: [
            {
                text: 'Paypal',
                cssClass: 'pay-paypal',
                handler: () => {
                    this.iab.create("https://paypal.me/reddah", '_system');
                }
            },
            {
              text: 'Alipay',
              role: 'destructive',
              cssClass: 'pay-alipay',
              handler: () => {
                this.alipayQrCode();
              }
            }, 
            {
              text: 'Wechat',
              cssClass: 'pay-wechatpay',
              handler: () => {
                this.wechatpayQrCode();
              }
            }
            
        ]
        });
        await actionSheet.present();
    }

    async alipayQrCode() {
        const alert = await this.alertController.create({
            //header: this.translate.instant("About.BuyBeer"),
            cssClass: 'pay-code',
            message: "<img src='/assets/icon/AlipayCode.jpeg'>",
        });
    
        await alert.present();
    }

    async wechatpayQrCode() {
        const alert = await this.alertController.create({
            //header: this.translate.instant("About.BuyBeer"),
            cssClass: 'pay-code',
            message: "<img src='/assets/icon/WechatZan.jpeg'>",
        });
    
        await alert.present();
    }

}
