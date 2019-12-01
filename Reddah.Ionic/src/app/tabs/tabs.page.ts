import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { Platform, Events } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { ModalController } from '@ionic/angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ReddahService } from '../reddah.service';
import { SwipeTabDirective } from '../swipe-tab.directive';
import { Tabs } from '@ionic/angular';
import { EarthPage } from './earth/earth.page';
import { MapPage } from '../map/map.page';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
    
    @ViewChild(SwipeTabDirective) swipeTabDirective: SwipeTabDirective;
    @ViewChild('myTabs') tabRef: Tabs;
    @ViewChild('about') about;

    isAndroid = false;
    isIos = false;

    constructor(
        private authService: AuthService,
        private platform: Platform,
        private localStorageService: LocalStorageService,
        private modalController: ModalController,
        private router: Router,
        public reddah: ReddahService,
        public events: Events,
        private translate: TranslateService,
        private speechRecognition: SpeechRecognition, 
    )
    {
        let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
        this.translate.setDefaultLang(currentLocale);
        this.translate.use(currentLocale);

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


    ngOnInit(){
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        if(locale==null){
            
        }
        
        if(this.platform.is('android')){
            this.isAndroid = true;
        }
        else if(this.platform.is('iphone')||this.platform.is('ipad')||this.platform.is('ios')){ 
            this.isIos = true;
        }

        if(this.platform.is('cordova')){
            

            // Stop the recognition process (iOS only)
            //this.speechRecognition.stopListening()

            // Get the list of supported languages
            this.speechRecognition.getSupportedLanguages()
            .then(
            (languages: string[]) => alert(JSON.stringify(languages)),
            (error) => console.log(error)
            )

            // Check permission
            this.speechRecognition.hasPermission()
            .then((hasPermission: boolean) => console.log(hasPermission))

            // Request permissions
            this.speechRecognition.requestPermission()
            .then(
            () => console.log('Granted'),
            () => console.log('Denied')
            )

            // Check feature available
            //this.speechRecognition.isRecognitionAvailable()
            //.then((available: boolean) => console.log(available))

            let options = {
                language: "en-US",
                matches: 5,
                prompt: true,      // Android only
                showPopup: true,  // Android only
                showPartial: true
              }
            // Start the recognition process
            this.speechRecognition.startListening(options)
            .subscribe(
            (matches: string[]) => alert(JSON.stringify(matches)),
            (onerror) => console.log('error:', onerror)
            )
        }
    }



    ionTabsDidChange($event) {
        //console.log('[TabsPage] ionTabsDidChange, $event: ', $event);
        this.swipeTabDirective.onTabInitialized($event.tab);
    }

    onTabChange($event) {
        //console.log('[TabsPage] onTabChange, $event: ', $event);
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

    async openEarth(){
        let yearslater = false;
        if(yearslater){
            const modal = await this.modalController.create({
                component: EarthPage,
                componentProps: {},
                cssClass: "modal-fullscreen",
            });
            
            await modal.present();
        }
        else{
            const modal = await this.modalController.create({
                component: MapPage,
                componentProps: {
                    //lat: this.config.lat,
                    //lng: this.config.lng
                },
                cssClass: "modal-fullscreen",
            });
              
            await modal.present();
        }
    }









    


}
