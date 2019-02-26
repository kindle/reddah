import { Component } from '@angular/core';
import { Platform } from '@ionic/angular'; 
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppUpdate } from '@ionic-native/app-update/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ModalController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { LocalePage } from '../locale/locale.page';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-about',
  templateUrl: 'about.page.html',
  styleUrls: ['about.page.scss']
})
export class AboutPage {
    currentLocaleInfo : String;
    version: String;

    constructor(
        private appVersion: AppVersion,
        private appUpdate: AppUpdate,
        private iab: InAppBrowser,
        private platform: Platform,
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        public modalController: ModalController,
        public navController: NavController,
        private router: Router,
        private service: ReddahService
    ) {
        this.getVersionNumber().then(version => {
            this.version = version;
        });

        this.currentLocaleInfo = "Not Set";
        const locale = this.localStorageService.retrieve("Reddah_Locale");
        this.service.Locales.forEach((value, index, arr)=>{
            if(locale===value.Name)
                this.currentLocaleInfo = value.Description;
        });
        

    }
    
    image:any=''
    

    async takePhoto(){
        const options: CameraOptions = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE
          }
          
          Camera.getPicture(options).then((imageData) => {
           // imageData is either a base64 encoded string or a file URI
           // If it's base64 (DATA_URL):
           //alert(imageData)
           this.image=(<any>window).Ionic.WebView.convertFileSrc(imageData);
          }, (err) => {
           // Handle error
           alert("error "+JSON.stringify(err))
          });
        
    }

    

    getVersionNumber(): Promise<string> {
        return new Promise((resolve) => {
            this.appVersion.getVersionNumber().then((value: string) => {
                resolve(value);
            }).catch(err => {
                console.log('getVersionNumber:' + err);
            });
        });
    }

    upgrade() {
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


    async changeLocale(){
        let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
        const changeLocaleModal = await this.modalController.create({
        component: LocalePage,
        componentProps: { orgLocale: currentLocale }
        });
        
        await changeLocaleModal.present();
        const { data } = await changeLocaleModal.onDidDismiss();
        if(data){
            console.log(data)
            //this.router.navigateByUrl('/tabs/(home:home)');
            window.location.reload();
        }

    }

}
