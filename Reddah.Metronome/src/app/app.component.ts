import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { ReddahService } from './reddah.service';
import { LocalStorageService } from 'ngx-webstorage';

import { Globalization } from '@ionic-native/globalization/ngx';


import {
    Plugins,
    StatusBarStyle,
    Capacitor,
} from '@capacitor/core';

const { App, StatusBar, SplashScreen, Geolocation } = Plugins;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private globalization: Globalization,
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            SplashScreen.hide();
            if(this.reddah.isMobile()){
                StatusBar.hide();
            }
            this.reddah.init();
            let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
            let defaultLocale ="en-US"
            if(currentLocale==null){
              if(this.reddah.isMobile())
              { 
                  this.globalization.getPreferredLanguage()
                  .then(res => {
                      let localeStr = this.reddah.fixLocaleStr(res.value);
                      if(this.reddah.Locales.filter(l=>l.Name==localeStr).length>0)
                      {
                        this.localStorageService.store("Reddah_Locale", localeStr);
                        this.reddah.loadTranslate(localeStr);
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
        });
    }
}
