import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import * as tf from '@tensorflow/tfjs';

import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from './reddah.service';
import { Globalization } from '@ionic-native/globalization/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    //private statusBar: StatusBar,
    private localStorageService: LocalStorageService,
    private reddah: ReddahService,
    private globalization: Globalization,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    /*this.reddah.test1();
    this.reddah.test2();
    this.reddah.test3();*/
    this.platform.ready().then(() => {
      //this.statusBar.styleDefault();
      this.splashScreen.hide();
      
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

      let loadModel = (async ()=> {
        this.reddah.tfModel = await tf.loadLayersModel('/assets/mnist/model.json');
      })
      loadModel();
    });
  }
}
