import { Component, ViewChild, ViewChildren,QueryList, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ModalController, AlertController, ActionSheetController, PopoverController, IonRouterOutlet, MenuController, LoadingController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { ImageLoaderConfigService } from 'ionic-image-loader';
import { CacheService } from "ionic-cache";
//import * as firebase from 'firebase';
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
        private router: Router,
        private imageLoaderConfigService: ImageLoaderConfigService,
        private cacheService: CacheService,
        private androidPermissions: AndroidPermissions,
        private reddah: ReddahService,
        private authService: AuthService,
        private zone: NgZone,
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
                Globalization.getPreferredLanguage()
                .then(res => {
                    this.localStorageService.store("Reddah_Locale", res.value);
                    this.translate.setDefaultLang(res.value);
                })
                .catch(e => {
                    this.localStorageService.store("Reddah_Locale", defaultLocale);
                    this.translate.setDefaultLang(defaultLocale);
                });
            }
            else{
                this.localStorageService.store("Reddah_Locale", defaultLocale);
                this.translate.setDefaultLang(defaultLocale);
                this.translate.use(defaultLocale);
            }

        }
        else{
            this.zone.run(()=>{
                this.translate.setDefaultLang(currentLocale);
                this.translate.use(currentLocale);
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


        //load friends to cache for permission check
        if(this.authService.authenticated())
        {
            this.reddah.loadFriends();
            this.reddah.getMessageUnread().subscribe(data=>{
                if(data.Success==0){
                    this.reddah.unReadMessage = data.Message;
                }
            });

            if(!this.reddah.checkPoint(this.reddah.pointTasks[0])){
                this.reddah.getPointLogin().subscribe(data=>{
                    if(data.Success==0||data.Success==3){ 
                        this.localStorageService.store(`Reddah_Login_PointToday_${this.reddah.getTodayString()}_${this.reddah.getCurrentUser()}`, data.Message.GotPoint);
                        if(data.Success==0){
                            this.reddah.toast("登录获得积分+"+data.Message.GotPoint+"分", "primary");
                        }
                    }
                });
            }
        }
        
        let currentFontSize = this.localStorageService.retrieve("Reddah_fontsize");
        if(!currentFontSize)
            currentFontSize = 4;
        document.documentElement.style.setProperty(`--ion-font-size`, this.reddah.fontSizeMap.get(currentFontSize));

        this.reddah.getUserPhotos(this.reddah.getCurrentUser());
    }

    // set up hardware back button event.
    lastTimeBackPress = 0;
    timePeriodToExit = 2000;

    @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;
    @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
    
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
        });
    }

}
