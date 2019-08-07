import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { Platform, Events } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { ModalController } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ReddahService } from '../reddah.service';
import { SwipeTabDirective } from '../swipe-tab.directive';
import { Tabs } from '@ionic/angular';

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
    
    @ViewChild(SwipeTabDirective) swipeTabDirective: SwipeTabDirective;
    @ViewChild('myTabs') tabRef: Tabs;
    @ViewChild('map') map;
    @ViewChild('about') about;

    constructor(
        private authService: AuthService,
        private platform: Platform,
        private localStorageService: LocalStorageService,
        private modalController: ModalController,
        private statusBar: StatusBar,
        private router: Router,
        public reddah: ReddahService,
        public events: Events,
        
    )
    {
        this.events.subscribe('tab:clicked', (data) => 
        {
            try{
                let index = data['tab'];
                let lat = data['lat'];
                let lng = data['lng'];
                //this.tabRef.select(this.map);
                this.router.navigateByUrl(`/tabs/(map:map)?lat=${lat}&lng=${lng}`);
            }catch(e){}
        });
    }

    async gotoEarth(){
        this.router.navigateByUrl(`/tabs/(earth:earth)`);
    }

    async ngOnInit(){
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        if(locale==null){
            
        }
        
    }



    ionTabsDidChange($event) {
        console.log('[TabsPage] ionTabsDidChange, $event: ', $event);
        this.swipeTabDirective.onTabInitialized($event.tab);
    }

    onTabChange($event) {
        console.log('[TabsPage] onTabChange, $event: ', $event);
        this.tabRef.select($event);
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
        this.reddah.getMessageUnread().subscribe(data=>{
            if(data.Success==0){
                this.reddah.unReadMessage = data.Message;
            }
        });
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
