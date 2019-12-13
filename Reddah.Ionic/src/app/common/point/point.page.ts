import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import { HistoryPage } from './history/history.page';
import { PunchClockPage } from './punch-clock/punch-clock.page';
import { LocalStorageService } from 'ngx-webstorage';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-point',
    templateUrl: 'point.page.html',
    styleUrls: ['point.page.scss']
})
export class PointPage implements OnInit {

    points = [];
    loadedIds = [];

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    @ViewChild('pageTop') pageTop: Content;
    
    userName: any;

    async close(){
        this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        private popoverController: PopoverController,
        public modalController: ModalController,
        private translate: TranslateService,
        private cacheService: CacheService,
        private localStorageService: LocalStorageService,
        private datePipe: DatePipe,
    ){
        this.userName = this.reddah.getCurrentUser();
    }


    async ngOnInit(){
        this.reddah.checkOncePoint().subscribe(data=>{
            if(data.Success==0){
                this.reddah.setPointNoDate("Photo", data.Message.Photo);
                this.reddah.setPointNoDate("Signature", data.Message.Signature);
                this.reddah.setPointNoDate("Timeline", data.Message.Timeline);
                this.reddah.setPointNoDate("Mini", data.Message.Mini);
                this.reddah.setPointNoDate("Friend", data.Message.Friend);
                this.reddah.setPointNoDate("Shake", data.Message.Shake);
                this.reddah.setPoint("TodayTotalPoint", data.Message.TodayTotalPoint)
            }
        });
        
        
        this.reddah.getUserPhotos(this.userName);
    }
     

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("PointPage");
        
    }

    //drag down
    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    //drag up
    loadData(event) {
        
    }

    async pointDetails(){
        const modal = await this.modalController.create({
            component: HistoryPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
    
        await modal.present();
    }

    async punchClock(){
        const modal = await this.modalController.create({
            component: PunchClockPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
    
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.ngOnInit();
        }
    }


    
    
}
