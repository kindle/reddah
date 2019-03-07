import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private authService: AuthService,
    private platform: Platform,
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
}
