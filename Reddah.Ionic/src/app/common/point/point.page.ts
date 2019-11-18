import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";

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

        this.points = [];
        this.loadedIds = [];

        let cacheKey = "this.reddah.getPoints" + JSON.stringify(this.loadedIds);
        let formData = new FormData();
        formData.append("loadedIds", JSON.stringify(this.loadedIds));
        let request = this.reddah.getPoints(formData);

        this.cacheService.loadFromObservable(cacheKey, request, "PointPage")
        .subscribe(result => 
        {
            console.log(result.Message)
            if(result.Success==0){
                console.log(this.points);
                for(let point of result.Message){
                    this.points.push(point);
                    this.loadedIds.push(point.Id);  
                }
            }
            else{
                console.log(result.Message);
            }
            
            loading.dismiss();
        });
    }
  
    getPoints(event):void {
        let cacheKey = "this.reddah.getPoints" + JSON.stringify(this.loadedIds);
        let formData = new FormData();
        formData.append("loadedIds", JSON.stringify(this.loadedIds));
        let request = this.reddah.getPoints(formData);

        this.cacheService.loadFromObservable(cacheKey, request, "PointPage")
        .subscribe(result => 
        {
            console.log(result)
            if(result.Success==0){
                for(let point of result.Message){
                    this.points.push(point);
                    this.loadedIds.push(point.Id);  
                }
            }
            
            if(event)
                event.target.complete();
        });
    }    

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("PointPage");
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
