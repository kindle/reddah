import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Plugins } from '@capacitor/core';
import { ReddahService } from './reddah.service';
import { AuthService } from './auth.service';
import { LocalStorageService } from 'ngx-webstorage';
import { CacheService } from 'ionic-cache';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private localStorageService: LocalStorageService,
    public reddah: ReddahService,
    private authService: AuthService,
    private cacheService: CacheService,
  ) {
    this.initializeApp();
  }


  platformTag;
  async checkPlatform (){
    const { Device } = Plugins;
    // Only show the Apple sign in button on iOS

    let device = await Device.getInfo();
    this.platformTag = device.platform;
  }

  initializeApp() {
    this.checkPlatform();
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.initPlugins();
    });
  }

  initPlugins(){
      let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
      let defaultLocale ="en-US"
      if(currentLocale==null){
          if(this.platformTag==="ios"||
            this.platformTag==="android")
          { 
              /*this.globalization.getPreferredLanguage()
              .then(res => {
                  this.localStorageService.store("Reddah_Locale", res.value);
                  this.reddah.loadTranslate(res.value);
              })
              .catch(e => {
                  this.localStorageService.store("Reddah_Locale", defaultLocale);
                  this.reddah.loadTranslate(defaultLocale);
              });*/
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
      */
  
      this.cacheService.enableCache(true);
      this.cacheService.setDefaultTTL(365 * 24 * 60 * 60); //set default cache TTL for 365 days


      
      let currentFontSize = this.localStorageService.retrieve("Reddah_fontsize");
      if(!currentFontSize)
          currentFontSize = 4;
      document.documentElement.style.setProperty(`--ion-font-size`, this.reddah.fontSizeMap.get(currentFontSize));

      this.reddah.getUserPhotos(this.reddah.getCurrentUser());

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
  }
}
