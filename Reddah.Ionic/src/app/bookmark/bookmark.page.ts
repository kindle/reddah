import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../model/article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController } from '@ionic/angular';
import { LocalePage } from '../common/locale/locale.page';
import { PostviewerPage } from '../postviewer/postviewer.page';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import { MyInfoPage } from '../common/my-info/my-info.page';

@Component({
    selector: 'app-bookmark',
    templateUrl: 'bookmark.page.html',
    styleUrls: ['bookmark.page.scss']
})
export class BookmarkPage implements OnInit {

    bookmarks = [];
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

        let cacheKey = "this.reddah.getBookmarks" + JSON.stringify(this.loadedIds);
        let formData = new FormData();
        formData.append("loadedIds", JSON.stringify(this.loadedIds));
        let request = this.reddah.getBookmarks(formData);

        this.cacheService.loadFromObservable(cacheKey, request, "BookmarkPage")
        .subscribe(result => 
        {
            if(result.Success==0){
                for(let bookmark of result.Message){
                    this.bookmarks.push(bookmark);
                    this.loadedIds.push(bookmark.Id);  
                }
            }
            else{
                console.log(result.Message);
            }
            
            loading.dismiss();
        });
    }
  
    getBookmarks(event):void {
        let cacheKey = "this.reddah.getBookmarks" + JSON.stringify(this.loadedIds);
        let formData = new FormData();
        formData.append("loadedIds", JSON.stringify(this.loadedIds));
        let request = this.reddah.getBookmarks(formData);

        this.cacheService.loadFromObservable(cacheKey, request, "BookmarkPage")
        .subscribe(result => 
        {
            if(result.Success==0){
                for(let bookmark of result.Message){
                    this.bookmarks.push(bookmark);
                    this.loadedIds.push(bookmark.Id);  
                }
            }
            
            if(event)
                event.target.complete();
        });
    }    

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("BookmarkPage");
        this.getBookmarks(event);
    }

    //drag down
    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    //drag up
    loadData(event) {
        this.getBookmarks(event);
    }
    
    async view(article: Article){
        const viewerModal = await this.modalController.create({
            component: PostviewerPage,
            componentProps: { article: article }
        });
        
        await viewerModal.present();
        const { data } = await viewerModal.onDidDismiss();
        if(data){
            console.log(data)
        }

    }

}
