import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ModalController, AlertController, ActionSheetController, PopoverController, IonRouterOutlet, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Toast } from '@ionic-native/toast/ngx';
import { ImageLoaderConfigService } from 'ionic-image-loader';
import { CacheService } from "ionic-cache";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateService,
    private localStorageService: LocalStorageService,
    public modalCtrl: ModalController,
    private menu: MenuController,
    private actionSheetCtrl: ActionSheetController,
    private alertController: AlertController,
    private popoverCtrl: PopoverController,
    private toast: Toast,
    private router: Router,
    private imageLoaderConfigService: ImageLoaderConfigService,
    private cacheService: CacheService,
  ) {
        this.initializeApp();

        this.imageLoaderConfigService.useImageTag(true);
        this.imageLoaderConfigService.enableSpinner(false);
        this.imageLoaderConfigService.setConcurrency(10);
        this.imageLoaderConfigService.setCacheDirectoryName('redda.com.cache');
        this.imageLoaderConfigService.setMaximumCacheSize(20 * 1024 * 1024 * 1024); // set max size to 20GB
        this.imageLoaderConfigService.setMaximumCacheAge(365 * 24 * 60 * 60 * 1000); // 365 days
        //this.imageLoaderConfigService.enableFallbackAsPlaceholder(true);
        //this.imageLoaderConfigService.setFallbackUrl('assets/fallback.png');
        //const headers = new HttpHeaders()
        //              .set("Authorization", "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA==");
        //this.imageLoaderConfig.setHttpHeaders(headers);
        this.cacheService.enableCache(true);
        this.cacheService.setDefaultTTL(365 * 24 * 60 * 60); //set default cache TTL for 365 days

        let locale = this.localStorageService.retrieve("Reddah_Locale");
        this.translate.setDefaultLang(locale);

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    
    // Initialize BackButton Eevent.
    this.backButtonEvent();
  }

  // set up hardware back button event.
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;

  @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;

  
  public alertShown:boolean = false;

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: this.translate.instant("Confirm.Title"),
      message: this.translate.instant("Confirm.Message"),
      buttons: [
        {
          text: this.translate.instant("Confirm.Cancel"),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.alertShown=false;
          }
        }, {
          text: this.translate.instant("Confirm.Yes"),
          handler: () => {
            navigator['app'].exitApp();
          }
        }
      ]
    });

    await alert.present().then(()=>{
        this.alertShown=true;
    });;
  }

  // active hardware back button
  backButtonEvent() {
      this.platform.backButton.subscribe(async () => {
        /*try {
            const element = await this.actionSheetCtrl.getTop();
            if (element) {
                element.dismiss();
                return;
            }
        } catch (error) {
        }

        // close popover
        try {
            const element = await this.popoverCtrl.getTop();
            if (element) {
                element.dismiss();
                return;
            }
        } catch (error) {
        }
*/
        // close modal
        try {
            const element = await this.modalCtrl.getTop();
            if (element) {
                element.dismiss();
                return;
            }
        } catch (error) {
            console.log(error);

        }/*

        // close side menua
        try {
            const element = await this.menu.getOpen();
            if (element !== null) {
                this.menu.close();
                return;

            }

        } catch (error) {

        }*/

        if( this.router.url.startsWith('/tabs/(home:home)')) 
        {
            if(this.alertShown==false){
                this.presentAlertConfirm();  
            }
        }
        else if(this.routerOutlet && this.routerOutlet.canGoBack())
        {
            this.routerOutlet.pop();
        }  
      });
  }

}
