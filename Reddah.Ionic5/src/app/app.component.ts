import { Component, NgZone } from '@angular/core';

import { Platform } from '@ionic/angular';

import {
    Plugins,
    StatusBarStyle,
    Capacitor,
  } from '@capacitor/core';

const { App, StatusBar, SplashScreen, Geolocation } = Plugins;

import { ModalController, AlertController, ActionSheetController, PopoverController, IonRouterOutlet, MenuController, LoadingController } from '@ionic/angular';

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
import { Router } from '@angular/router';
//import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
        //private splashScreen: SplashScreen,
        //private statusBar: StatusBar,
        private localStorageService: LocalStorageService,
        public modalController: ModalController,
        private menu: MenuController,
        private actionSheetCtrl: ActionSheetController,
        private alertController: AlertController,
        private popoverCtrl: PopoverController,
        private globalization: Globalization,
        //private imageLoaderConfigService: ImageLoaderConfigService,
        private cacheService: CacheService,
        public reddah: ReddahService,
        private authService: AuthService,
        private loadingController: LoadingController,
        private router: Router,
        private zone: NgZone,
        //private network: Network,
        //private firebase: Firebase,
  ) {
    this.initializeApp();
  }


  isStatusBarLight = true;

  initializeApp() {

    //deep link support
    App.addListener('appUrlOpen', (data: any) => {
        this.zone.run(() => {
            let slug = data.url.split(".app").pop();
            console.log("slug:"+slug)
            if (slug) {
                if(slug.indexOf('/user/')>-1) 
                {
                    this.router.navigate(['/surface'], {
                        queryParams: {
                            slugUserName:slug.replace('/user/','')
                        }
                    });
                }
            }
            // If no match, do nothing - let regular routing 
            // logic take over
        });
    });

    this.platform.ready().then(() => {
        this.isStatusBarLight = !this.authService.authenticated();
        if(this.reddah.isMobile())
        {
            /*StatusBar.setStyle({
                style: this.isStatusBarLight ? StatusBarStyle.Dark : StatusBarStyle.Light
            });
            this.isStatusBarLight = !this.isStatusBarLight;
        */

            //(Android only)
            if(Capacitor.platform==="android"){
                StatusBar.setOverlaysWebView({
                    overlay: false
                });
            }
            StatusBar.setBackgroundColor({
                color : "light"//`--ion-color-light`
            });

            /*if(Capacitor.platform==="ios"){
                StatusBar.hide();
            }*/
        
            //SplashScreen.hide();
        }
        this.initPlugins();
        this.backButtonEvent();

    });
  }

  initPlugins(){
      let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
      let defaultLocale ="en-US"
      if(currentLocale==null){
          if(this.reddah.isMobile())
          { 
              this.globalization.getPreferredLanguage()
              .then(res => {
                  if(this.reddah.Locales.filter(l=>l.Name==res.value).length>0)
                  {
                    this.localStorageService.store("Reddah_Locale", res.value);
                    this.reddah.loadTranslate(res.value);
                  }
                  else{
                    this.localStorageService.store("Reddah_Locale", defaultLocale);
                    this.reddah.loadTranslate(defaultLocale);
                  }
              })
              .catch(e => {
                  this.localStorageService.store("Reddah_Locale", defaultLocale);
                  this.reddah.loadTranslate(defaultLocale);
              });
          }
          else{
              this.localStorageService.store("Reddah_Locale", defaultLocale);
              this.reddah.loadTranslate(defaultLocale);
          }

      }
      else{
          this.reddah.loadTranslate(currentLocale);
      }

      
      
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

          /*let localVideoCache = this.localStorageService.retrieve("reddah_video_cache_queue_"+this.reddah.getCurrentUser());
          if(localVideoCache!=null){
              this.reddah.VideoArticleCacheQueue = new Queue<any>();
              this.reddah.VideoArticleCacheQueue._store = JSON.parse(localVideoCache);
          }*/

          this.reddah.getUserPhotos(this.reddah.getCurrentUser());
      }
      
      let currentFontSize = this.localStorageService.retrieve("Reddah_fontsize");
      if(!currentFontSize)
          currentFontSize = 4;
      document.documentElement.style.setProperty(`--ion-font-size`, this.reddah.fontSizeMap.get(currentFontSize));


      /*
      this.network.onDisconnect().subscribe(() => {
          this.reddah.networkConnected = false;
      });
      
      this.network.onConnect().subscribe(() => {
          this.reddah.networkConnected = true;
      });*/

      const { Network } = Plugins;
      Network.addListener('networkStatusChange', (status) => {
          this.reddah.networkConnected = status.connected
      });

      SplashScreen.hide();

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
          // close loading
          try {
            const element = await this.loadingController.getTop();
            if (element) {
                element.dismiss();
                return;
            }
        } catch (error) {
        }

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
