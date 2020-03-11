import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, IonContent } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";

@Component({
    selector: 'app-rank',
    templateUrl: 'rank.page.html',
    styleUrls: ['rank.page.scss']
})
export class RankPage implements OnInit {

    rank = [];
    loadedIds = [];

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

        this.rank = [];
        this.loadedIds = [];

        let cacheKey = "this.reddah.getGlobalRank" + JSON.stringify(this.loadedIds);
        let formData = new FormData();
        formData.append("loadedIds", JSON.stringify(this.loadedIds));
        let request = this.reddah.getGlobalRank(formData);

        this.cacheService.loadFromObservable(cacheKey, request, "RankPage")
        .subscribe(result => 
        {
            console.log(result.Message)
            if(result.Success==0){
                console.log(this.rank);
                for(let item of result.Message){
                    this.rank.push(item);
                    this.loadedIds.push(item.Id);  
                }
            }
            else{
                console.log(result.Message);
            }
            
            loading.dismiss();
        });
    }
  
    getRank(event):void {
        let cacheKey = "this.reddah.getGlobalRank" + JSON.stringify(this.loadedIds);
        let formData = new FormData();
        formData.append("loadedIds", JSON.stringify(this.loadedIds));
        let request = this.reddah.getGlobalRank(formData);

        this.cacheService.loadFromObservable(cacheKey, request, "RankPage")
        .subscribe(result => 
        {
            console.log(result)
            if(result.Success==0){
                for(let item of result.Message){
                    this.rank.push(item);
                    this.loadedIds.push(item.Id);  
                }
            }
            
            if(event)
                event.target.complete();
        });
    }    

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("RankPage");
        this.getRank(event);
    }

    //drag down
    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    //drag up
    loadData(event) {
        this.getRank(event);
    }
    
}
