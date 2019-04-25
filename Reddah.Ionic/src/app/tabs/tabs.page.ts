import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Platform } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private authService: AuthService,
    private platform: Platform,
    private localStorageService: LocalStorageService,
    ) {}

  login() {
    this.authService.login();
  }
 
  logout() {
    this.authService.logout();
  }
 
  isAuthenticated() {
    return this.authService.authenticated();
  }

  ionViewDidEnter(){
    //this.subscription = this.platform.backButton.subscribe(()=>{
    //    navigator['app'].exitApp();
    //});
  }

  ionViewWillLeave(){
      //this.subscription.unsubscribe();
  }

  isLocaleSet(){
      let locale = this.localStorageService.retrieve("Reddah_Locale");
      if(locale==undefined||locale==null)
          return false;
      return true;
  }
}
