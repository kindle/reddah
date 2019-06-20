import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { Platform } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { ModalController } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';


@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

    @ViewChild('about') about;

    constructor(private authService: AuthService,
        private platform: Platform,
        private localStorageService: LocalStorageService,
        private modalController: ModalController,
        private statusBar: StatusBar,
        ) {}

    
    async ngOnInit(){
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        if(locale==null){
            
        }

        
    }

    

    

    change(page=null){
        if(page=="about"){
            this.about.checked = false;
        }
        /*if(page=="about"){
            this.statusBar.overlaysWebView(true);
            this.statusBar.backgroundColorByHexString("#ffffff");
            this.localStorageService.store("statusbar_bgcolor", "white");
            this.statusBar.styleDefault();
        }
        else{
            let lastcolor = this.localStorageService.retrieve("statusbar_bgcolor");
            if(lastcolor!="#eeeeee"){
                this.localStorageService.store("statusbar_bgcolor", "#eeeeee");
                this.statusBar.overlaysWebView(true);
                this.statusBar.backgroundColorByHexString("#eeeeee");
                this.statusBar.styleDefault();
            }
        }*/
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
