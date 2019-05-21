import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Platform } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { ModalController } from '@ionic/angular';
import { LocalePage } from '../locale/locale.page';
import { StatusBar } from '@ionic-native/status-bar';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  constructor(private authService: AuthService,
    private platform: Platform,
    private localStorageService: LocalStorageService,
    private modalController: ModalController,
    ) {}

  async ngOnInit(){
      let locale = this.localStorageService.retrieve("Reddah_Locale");
      if(locale==null){
          let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
          const changeLocaleModal = await this.modalController.create({
              component: LocalePage,
              componentProps: { orgLocale: currentLocale }
          });
          
          await changeLocaleModal.present();
          const { data } = await changeLocaleModal.onDidDismiss();
          if(data){
              console.log(data)
              //this.router.navigateByUrl('/tabs/(home:home)');
              window.location.reload();
          }
      }

  }

  change(page=null){
      StatusBar.overlaysWebView(true);
      StatusBar.styleDefault();
      if(page=="about"){
          StatusBar.backgroundColorByHexString("#ffffff");
      }
      else{
          StatusBar.backgroundColorByHexString("#eeeeee");
      }
  }
  
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
