import { Component, ViewChild, ViewChildren,QueryList, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ModalController, AlertController, ActionSheetController, PopoverController, IonRouterOutlet, MenuController, LoadingController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
//import { ImageLoaderConfigService } from 'ionic-image-loader';
import { CacheService } from "ionic-cache";
//import * as firebase from 'firebase';
//import { Firebase } from '@ionic-native/firebase/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Globalization } from '@ionic-native/globalization/ngx';
import { ReddahService } from './reddah.service';
import { AuthService } from './auth.service';
import { Queue } from './model/UserModel';
import { Network } from '@ionic-native/network/ngx';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private localStorageService: LocalStorageService,
        public modalController: ModalController,
        private menu: MenuController,
        private actionSheetCtrl: ActionSheetController,
        private alertController: AlertController,
        private popoverCtrl: PopoverController,
        private router: Router,
        private globalization: Globalization,
        //private imageLoaderConfigService: ImageLoaderConfigService,
        private cacheService: CacheService,
        private androidPermissions: AndroidPermissions,
        public reddah: ReddahService,
        private authService: AuthService,
        private zone: NgZone,
        private network: Network,
        //private firebase: Firebase,
    ) {
        try{
            this.initializeApp();
        }
        catch(ex){
            console.log(ex)
        }
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.overlaysWebView(false);
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            this.initPlugins();
        });
        
        // Initialize BackButton Eevent.
        this.backButtonEvent();
    }

    initPlugins(){
        let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
        let defaultLocale ="en-US"
        if(currentLocale==null){
            if(this.platform.is('cordova'))
            { 
                this.globalization.getPreferredLanguage()
                .then(res => {
                    this.localStorageService.store("Reddah_Locale", res.value);
                    //this.translate.setDefaultLang(res.value);
                    this.reddah.loadTranslate(res.value);
                })
                .catch(e => {
                    this.localStorageService.store("Reddah_Locale", defaultLocale);
                    //this.translate.setDefaultLang(defaultLocale);
                    this.reddah.loadTranslate(defaultLocale);
                });
            }
            else{
                this.localStorageService.store("Reddah_Locale", defaultLocale);
                //this.translate.setDefaultLang(defaultLocale);
                this.reddah.loadTranslate(defaultLocale);
                //this.translate.use(defaultLocale);
            }

        }
        else{
            this.zone.run(()=>{
                //this.translate.setDefaultLang(currentLocale);
                //this.translate.use(currentLocale);
                this.reddah.loadTranslate(currentLocale);
            })
        }

        this.platform.ready().then(() => {
            if(this.platform.is('android'))
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
                this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION).then(
                    result => console.log('Has permission?',result.hasPermission),
                    err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
                );
                
                this.androidPermissions.requestPermissions([
                    this.androidPermissions.PERMISSION.CAMERA, 
                    this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
                    this.androidPermissions.PERMISSION.RECORD_AUDIO,
                    this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
                ]);
            }
        })
        
/*
        this.imageLoaderConfigService.useImageTag(true);
        this.imageLoaderConfigService.enableSpinner(false);
        this.imageLoaderConfigService.setConcurrency(10);
        //this.imageLoaderConfigService.setCacheDirectoryName('reddah');
        this.imageLoaderConfigService.setMaximumCacheSize(20 * 1024 * 1024 * 1024); // set max size to 20GB
        this.imageLoaderConfigService.setMaximumCacheAge(365 * 24 * 60 * 60 * 1000); // 365 days
        this.imageLoaderConfigService.cacheDirectoryType = "cache";
        this.imageLoaderConfigService.enableFallbackAsPlaceholder(true);
        this.imageLoaderConfigService.setFallbackUrl('assets/icon/noimage.jpg');*/;
        //this.file.dataDirectory = "/reddah";
        //this.file.createDir("/","reddah", false);
        
        //const headers = new HttpHeaders()
        //              .set("Authorization", "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA==");
        //this.imageLoaderConfig.setHttpHeaders(headers);
        this.cacheService.enableCache(true);
        this.cacheService.setDefaultTTL(365 * 24 * 60 * 60); //set default cache TTL for 365 days


        //load friends to cache for permission check
        if(this.authService.authenticated())
        {
            this.reddah.loadFriends();
            this.reddah.getMessageUnread().subscribe(data=>{
                if(data.Success==0){
                    this.reddah.unReadMessage = data.Message;
                }
            });
            let localCache = this.localStorageService.retrieve("reddah_cache_queue_"+this.reddah.getCurrentUser());
            if(localCache!=null){
                this.reddah.ArticleCacheQueue = new Queue<any>();
                this.reddah.ArticleCacheQueue._store = JSON.parse(localCache);
            }
        }
        
        let currentFontSize = this.localStorageService.retrieve("Reddah_fontsize");
        if(!currentFontSize)
            currentFontSize = 4;
        document.documentElement.style.setProperty(`--ion-font-size`, this.reddah.fontSizeMap.get(currentFontSize));

        this.reddah.getUserPhotos(this.reddah.getCurrentUser());

        this.network.onDisconnect().subscribe(() => {
            this.reddah.networkConnected = false;
        });
        
        this.network.onConnect().subscribe(() => {
            this.reddah.networkConnected = true;
        });
    }

    // set up hardware back button event.
    lastTimeBackPress = 0;
    timePeriodToExit = 2000;

    //@ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;
    //@ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
    
    public alertShown:boolean = false;

    async presentAlertConfirm() {
        const alert = await this.alertController.create({
            header: this.reddah.instant("Confirm.Title"),
            message: this.reddah.instant("Confirm.Message"),
            buttons: [
              {
                text: this.reddah.instant("Confirm.Cancel"),
                role: 'cancel',
                cssClass: 'secondary',
                handler: (blah) => {
                  this.alertShown=false;
                }
              }, {
                text: this.reddah.instant("Confirm.Yes"),
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
            // close action sheet
            try {
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

            // close modal
            try {
                const element = await this.modalController.getTop();
                if (element) {
                    element.dismiss();
                    return;
                }
            } catch (error) {
                console.log(error);

            }

            // close side menua
            try {
                const element = await this.menu.getOpen();
                if (element) {
                    this.menu.close();
                    return;

                }

            } catch (error) {

            }
/*
            this.routerOutlets.forEach((outlet: IonRouterOutlet) => {
                if (outlet && outlet.canGoBack()) 
                {
                    outlet.pop();
                } 
                else 
                {
                    if(this.router.url.indexOf("home")>0)
                    {
                        this.presentAlertConfirm();
                        return;
                    }
                    if(this.router.url.indexOf("surface")>0)
                    {
                        this.router.navigate(['/']);
                    }
                    //alert("*"+this.router.url)
                }
                
            });
*/
        });

    }

}
