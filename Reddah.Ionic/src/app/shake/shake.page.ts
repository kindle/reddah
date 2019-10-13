import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll, Content, Platform } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../model/article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { PostviewerPage } from '../postviewer/postviewer.page';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import { Shake } from '@ionic-native/shake/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { UserPage } from '../common/user/user.page';

@Component({
    selector: 'app-shake',
    templateUrl: 'shake.page.html',
    styleUrls: ['shake.page.scss']
})
export class ShakePage implements OnInit {

    watch;

    userName: any;

    async close(){
        if(this.platform.is('cordova')){
            this.watch.unsubscribe();
        }
        this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        private popoverController: PopoverController,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        private shake: Shake,
        private nativeAudio: NativeAudio,
        private platform: Platform,
        private geolocation: Geolocation,
    ){
        this.userName = this.reddah.getCurrentUser();

        if (this.platform.is('cordova')) {
            this.nativeAudio.preloadSimple('shake', 'assets/sound/shake.mp3')
            
            this.watch = this.shake.startWatch(60).subscribe(() => {
                this.shakeAni();
                this.nativeAudio.play("shake");
            });
        }
    }
    
    ngOnInit(){
        
    }

    test(){
        //test
        this.shakeAni();
    }

    showShakebg = true;
    showAnimetebg = false;
    async shakeAni(){
        this.showShakebg = false;
        this.showAnimetebg = true;

        this.shakeUser();

        setTimeout(() => {
            this.showAnimetebg = false;
            this.showShakebg = true;
            //alert("show bling bling...");
        }, 1000)
    }

    isChanged = false;
    users=[];
    async shakeUser(){
        //get current lat,lng
        this.geolocation.getCurrentPosition().then((resp) => {

            let degree = 5;
            let latCenter = resp.coords.latitude;
            let lngCenter = resp.coords.longitude;
            let latLow = (latCenter-degree)<-90?-90:(latCenter-degree); 
            let latHigh = (latCenter+degree)>90?90:(latCenter+degree);
            let lngLow = (lngCenter-degree)<-180?-180:(lngCenter-degree);
            let lngHigh = (lngCenter+degree)>180?180:(lngCenter+degree);
    
            //change my location
            let loc = {
                "title": this.userName,
                "location":{"lat":latCenter,"lng":lngCenter}
            }
            if(!this.isChanged){
                this.reddah.saveUserLocation(this.userName, loc, latCenter, lngCenter, "shake");
                this.isChanged = true;
            }
            

            //get cache by current hour.
            let mins = 4;
            let cacheKey = `this.reddah.shakeUsersByLocation${latCenter}${lngCenter}${latLow}${latHigh}${lngLow}${lngHigh}${this.reddah.getTimeString()}`;
            let request = this.reddah.getUsersByLocation(-1,latCenter, lngCenter, latLow, latHigh, lngLow, lngHigh, mins);
    
            this.cacheService.loadFromObservable(cacheKey, request, "shakeUsersByLocation")
            //this.reddah.getUsersByLocation(latCenter, lngCenter, latLow, latHigh, lngLow, lngHigh, mins)
            .subscribe(data=>{
                if(data.Success==0){
                    let showArray = [];
                    let showNumber = 1;
                    if(data.Message.length<=showNumber){
                        for(let i =0;i<data.Message.length;i++)
                            showArray.push(i);
                    }else{
                        showArray = this.reddah.getRandomArray(showNumber, data.Message.length);
                    }
                    data.Message.forEach((user, index) => {
                        this.reddah.getUserPhotos(user.UserName);
                        if(showArray.includes(index)){
                            
                            this.users =[];
                            this.users.push(user);
                        }
    
                    });
                }
                else{
                    alert(JSON.stringify(data));
                }
            });

        }).catch((error) => {
            alert('Error getting location:'+JSON.stringify(error));
        });

        
    }

    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            }
        });
          
        await userModal.present();
    }
    
}
