import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { Article } from '../../model/article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController } from '@ionic/angular';
import { PostviewerPage } from '../../postviewer/postviewer.page';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import { MyInfoPage } from '../../common/my-info/my-info.page';
import { SearchPage } from '../../common/search/search.page';
import { UserPage } from '../../common/user/user.page';
import { PubPage } from '../publisher/pub/pub.page';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {

    articles = [];
    loadedIds = [];

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    @ViewChild('pageTop') pageTop: Content;
    
    userName: any;
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
        let cacheArticles = this.localStorageService.retrieve("reddah_articles");
        let cacheArticleIds = this.localStorageService.retrieve("reddah_article_ids");
        if(cacheArticles){
            this.articles = JSON.parse(cacheArticles);
            this.loadedIds = JSON.parse(cacheArticleIds);
        }
        else
        {
            let locale = this.reddah.getCurrentLocale();
            let cacheKey = "this.reddah.getArticles" + JSON.stringify(this.loadedIds) + locale;
            let request = this.reddah.getArticles(this.loadedIds, locale, "promoted");

            this.cacheService.loadFromObservable(cacheKey, request, "HomePage")
            .subscribe(articles => 
            {
                console.log(articles);
                for(let article of articles){
                    this.articles.push(article);
                    this.loadedIds.push(article.Id);
                }
                this.localStorageService.store("reddah_articles", JSON.stringify(this.articles));
                this.localStorageService.store("reddah_article_ids", JSON.stringify(this.loadedIds));
            });
        }
    }
  
    getArticles(event):void {
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        if(locale==null)
            locale = "en-US"

        let cacheKey = "this.reddah.getArticles" + JSON.stringify(this.loadedIds) + locale;
        let request = this.reddah.getArticles(this.loadedIds, locale, "promoted");

        this.cacheService.loadFromObservable(cacheKey, request, "HomePage")
        .subscribe(articles => 
        {
            console.log(articles);
            for(let article of articles){
                this.articles.push(article);
                this.loadedIds.push(article.Id);  
            }
            this.localStorageService.store("reddah_articles", JSON.stringify(this.articles));
            this.localStorageService.store("reddah_article_ids", JSON.stringify(this.loadedIds));
            if(event){
                event.target.complete();
            }
        });
    }    

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("HomePage");
        this.localStorageService.clear("reddah_articles");
        this.localStorageService.clear("reddah_article_ids");
        this.articles = [];
        this.loadedIds = [];
        this.getArticles(event);
    }

    //drag down
    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    //drag up
    loadData(event) {
        this.getArticles(event);
    }

    async myInfo() {
        const myInfoModal = await this.modalController.create({
            component: MyInfoPage,
            componentProps: {  }
        });
        
        await myInfoModal.present();
        const { data } = await myInfoModal.onDidDismiss();
        //check if change
        if(data)
            this.reddah.getUserPhotos(this.userName);
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

    async goSearch(key){
        const userModal = await this.modalController.create({
            component: SearchPage,
            componentProps: { 
                key: key,
                type: 0,//article only
            }
        });
          
        await userModal.present();
    }

    async goUser(userName){
        let isNormalUser = true;
        if(userName.length==32)
            isNormalUser = false;

        const modal = await this.modalController.create({
            component: isNormalUser?UserPage:PubPage,
            componentProps: { 
                userName: userName
            }
        });
          
        await modal.present();
    }
    
}
