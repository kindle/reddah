import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, IonContent } from '@ionic/angular';
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
    lastId = 0;

    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    @ViewChild('pageTop') pageTop: IonContent;
    
    userName: any;

    async close(){
        this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        public modalController: ModalController,
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

        let formData = new FormData();
        formData.append("id", JSON.stringify(this.lastId));
        let cacheKey = "this.reddah.getPointHistory"+this.lastId;
        let request = this.reddah.getPoints(formData);

        this.cacheService.loadFromObservable(cacheKey, request, "HistoryPage")
        .subscribe(result => 
        {
            if(result.Success==0){
                for(let point of result.Message){
                    this.points.push(point); 
                    this.lastId = point.Id;
                }
            }
            else{
                console.log(result.Message);
            }
            
            loading.dismiss();
        });
    }
  
    getPoints(event):void {
        let formData = new FormData();
        formData.append("id", JSON.stringify(this.lastId));
        let cacheKey = "this.reddah.getPointHistory"+this.lastId;
        let request = this.reddah.getPoints(formData);

        this.cacheService.loadFromObservable(cacheKey, request, "HistoryPage")
        .subscribe(result => 
        {
            if(result.Success==0){
                for(let point of result.Message){
                    this.points.push(point);
                    this.lastId = point.Id;
                }
            }
            
            if(event)
                event.target.complete();
        });
    }    

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("HistoryPage");
        this.points = [];
        this.lastId = 0;
        this.getPoints(event);
    }

    //drag down
    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    loadMoreData(event) {
        this.getPoints(event);
    }
    
}
