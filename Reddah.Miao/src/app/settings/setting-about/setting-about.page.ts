import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { Platform } from '@ionic/angular'; 
import { AlertController, ActionSheetController } from '@ionic/angular';

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
        private platform: Platform,
        private modalController: ModalController,
        public reddah: ReddahService,
        public authService: AuthService,
        private actionSheetController: ActionSheetController,
        private alertController: AlertController,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }

    ngOnInit() {
        if(this.reddah.isMobile()){
            this.reddah.getVersionNumber().then(version => {
                this.version = version;
            });
        }

        //upgrade auto when come in
        //this.upgrade();
    }

    upgradeChecked = false;


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
        if(this.reddah.isIos()){
            storeAppURL = `itms-apps://itunes.apple.com/app/id${iosId}`;
            window.open(storeAppURL);
        }
        else if(this.reddah.isAndroid()){
            storeAppURL = "market://details?id=com.reddah.app";
            this.reddah.Browser(storeAppURL);
        }
        else{
            storeAppURL = `https://apps.apple.com/cn/app/id${iosId}?l=${this.reddah.getCurrentLocale()}`;
            this.reddah.Browser(storeAppURL);
        }

    }

    async buymebeer(){
        if(this.platform.is('android'))
        {

        }
        if(this.platform.is('ios')){

        }

        const actionSheet = await this.actionSheetController.create({
            header: this.reddah.instant("About.BuyBeer"),
            buttons: [
            {
                text: 'Paypal',
                cssClass: 'pay-paypal',
                handler: () => {
                    this.reddah.Browser("https://paypal.me/reddah");
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
