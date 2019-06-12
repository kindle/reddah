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

@Component({
    selector: 'app-shake',
    templateUrl: 'shake.page.html',
    styleUrls: ['shake.page.scss']
})
export class ShakePage implements OnInit {

    watch;

    userName: any;

    async close(){
        this.watch.unsubscribe();
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

    showShakebg = true;
    showAnimetebg = false;
    async shakeAni(){
        this.showShakebg = false;
        this.showAnimetebg = true;

        setTimeout(() => {
            this.showAnimetebg = false;
            this.showShakebg = true;
            //alert("show bling bling...");
        }, 1000)
    }


    async ngOnInit(){
        
    }
    
}
