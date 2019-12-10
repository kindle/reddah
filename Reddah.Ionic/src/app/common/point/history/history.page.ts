import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";

@Component({
    selector: 'app-history',
    templateUrl: 'history.page.html',
    styleUrls: ['history.page.scss']
})
export class HistoryPage implements OnInit {

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
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,

    ){
        this.userName = this.reddah.getCurrentUser();
    }

    async ngOnInit(){
        const loading = await this.loadingController.create({
            message: this.translateService.instant("Article.Loading"),
            spinner: 'circles',
        });
        await loading.present();

        let cacheKey = "this.reddah.getPointHistory";
        let request = this.reddah.getPoints();

        this.cacheService.loadFromObservable(cacheKey, request, "HistoryPage")
        .subscribe(result => 
        {
            if(result.Success==0){
                for(let point of result.Message){
                    this.points.push(point); 
                }
            }
            else{
                console.log(result.Message);
            }
            
            loading.dismiss();
        });
    }
  
    getPoints(event):void {
        this.points = [];
        let cacheKey = "this.reddah.getPointHistory";
        let request = this.reddah.getPoints();

        this.cacheService.loadFromObservable(cacheKey, request, "HistoryPage")
        .subscribe(result => 
        {
            //alert(JSON.stringify(result));
            if(result.Success==0){
                for(let point of result.Message){
                    this.points.push(point);
                }
            }
            
            if(event)
                event.target.complete();
        });
    }    

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("HistoryPage");
        this.getPoints(event);
    }

    //drag down
    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    //drag up
    loadData(event) {
        this.getPoints(event);
    }
    
}
