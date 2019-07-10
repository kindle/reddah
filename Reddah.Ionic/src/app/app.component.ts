import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ModalController, AlertController, ActionSheetController, PopoverController, IonRouterOutlet, MenuController, LoadingController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Toast } from '@ionic-native/toast/ngx';
import { ImageLoaderConfigService } from 'ionic-image-loader';
import { CacheService } from "ionic-cache";
import { File } from '@ionic-native/file/ngx';
import * as firebase from 'firebase';
//import { Firebase } from '@ionic-native/firebase/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Globalization } from '@ionic-native/globalization';
import { ReddahService } from './reddah.service';
import { AuthService } from './auth.service';

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
        public modalController: ModalController,
        private menu: MenuController,
        private actionSheetCtrl: ActionSheetController,
        private alertController: AlertController,
        private popoverCtrl: PopoverController,
        private loadingController: LoadingController,
        private toast: Toast,
        private router: Router,
        private imageLoaderConfigService: ImageLoaderConfigService,
        private cacheService: CacheService,
        private file: File,
        private androidPermissions: AndroidPermissions,
        private reddah: ReddahService,
        private authService: AuthService,
        //private firebase: Firebase,
    ) {
        this.initializeApp();

        if(this.platform.is('cordova'))
        {
            this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
                result => console.log('Has permission?',result.hasPermission),
                err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
            );
            this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
                result => console.log('Has permission?',result.hasPermission),
                err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
            );
            this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO).then(
                result => console.log('Has permission?',result.hasPermission),
                err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO)
            );
            
            this.androidPermissions.requestPermissions([
                this.androidPermissions.PERMISSION.CAMERA, 
                this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
                this.androidPermissions.PERMISSION.RECORD_AUDIO,
            ]);
        }

        this.imageLoaderConfigService.useImageTag(true);
        this.imageLoaderConfigService.enableSpinner(false);
        this.imageLoaderConfigService.setConcurrency(10);
        //this.imageLoaderConfigService.setCacheDirectoryName('reddah');
        this.imageLoaderConfigService.setMaximumCacheSize(20 * 1024 * 1024 * 1024); // set max size to 20GB
        this.imageLoaderConfigService.setMaximumCacheAge(365 * 24 * 60 * 60 * 1000); // 365 days
        this.imageLoaderConfigService.cacheDirectoryType = "cache";
        this.imageLoaderConfigService.enableFallbackAsPlaceholder(true);
        this.imageLoaderConfigService.setFallbackUrl('assets/icon/noimage.jpg');
        //this.file.dataDirectory = "/reddah";
        //this.file.createDir("/","reddah", false);
        
        //const headers = new HttpHeaders()
        //              .set("Authorization", "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA==");
        //this.imageLoaderConfig.setHttpHeaders(headers);
        this.cacheService.enableCache(true);
        this.cacheService.setDefaultTTL(365 * 24 * 60 * 60); //set default cache TTL for 365 days

        
        let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
        if(currentLocale==null){
            Globalization.getPreferredLanguage()
            .then(res => {
                this.localStorageService.store("Reddah_Locale", res.value);
                this.translate.setDefaultLang(res.value);
            })
            .catch(e => alert(JSON.stringify(e)));

        }
        else{
            this.translate.setDefaultLang(currentLocale);
        }

        //load friends to cache for permission check
        if(this.authService.authenticated())
        {
            this.reddah.loadFriends();
            this.reddah.getMessageUnread().subscribe(data=>{
                if(data.Success==0){
                    this.reddah.unReadMessage = data.Message;
                }
            });
        }
        
        let currentFontSize = this.localStorageService.retrieve("Reddah_fontsize");
        if(!currentFontSize)
            currentFontSize = 1;
        document.documentElement.style.setProperty(`--ion-font-size`, this.reddah.fontSizeMap.get(currentFontSize));

/*
        var firebaseConfig = {
            apiKey: "AIzaSyBKOOSwSguEIBc--d6QbUSkO4m2G7Au9fY",
            authDomain: "reddah-com.firebaseapp.com",
            databaseURL: "https://reddah-com.firebaseio.com",
            projectId: "reddah-com",
            storageBucket: "reddah-com.appspot.com",
            messagingSenderId: "64237460591",
            appId: "1:64237460591:web:4f2a4411eca1162f"
          };
          */
        //firebase.initializeApp(firebaseConfig);
    }

    initializeApp() {
        this.platform.ready().then(() => {
            //this.statusBar.overlaysWebView(true);
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
        });
    }

    // active hardware back button
    backButtonEvent() {
        this.platform.backButton.subscribe(async () => {
            let popFlag = true;
            try {
                const element = await this.actionSheetCtrl.getTop();
                if (element) {
                    element.dismiss();
                    popFlag = false;
                }
            } catch (error) {}

            // close popover
            try {
                const element = await this.popoverCtrl.getTop();
                if (element) {
                    element.dismiss();
                    popFlag = false;
                }
            } catch (error) {}

            // loading control
            try {
                const element = await this.loadingController.getTop();
                if (element) {
                    element.dismiss();
                    popFlag = false;
                }
            } catch (error) {}
            
            // close modal
            try {
                const element = await this.modalController.getTop();
                if (element) {
                    element.dismiss();
                    popFlag = false;
                }
            } catch (error) {}

            //close side menua
            try {
                const element = await this.menu.getOpen();
                if (element !== null) {
                    this.menu.close();
                    popFlag = false;

                }

            } catch (error) {}

            if(popFlag)
            {
                if(this.router.url.startsWith('/tabs/(home:home)')||
                this.router.url==('/')) 
                {
                    if(this.alertShown==false){
                        this.presentAlertConfirm();  
                    }
                }
                else if(this.routerOutlet && this.routerOutlet.canGoBack())
                {
                    this.routerOutlet.pop();
                }  
            }
        });
    }

}
