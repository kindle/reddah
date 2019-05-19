import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController } from '@ionic/angular';
import { LocalePage } from '../locale/locale.page';
import { PostviewerPage } from '../postviewer/postviewer.page';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import { MyInfoPage } from '../my-info/my-info.page';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {

    articles: Article[];
    loadedIds: Number[];

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    
    loadData(event) {
        this.getArticles();
        event.target.complete();
    }

    userName: any;
    constructor(public reddah : ReddahService,
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
        let locale = this.reddah.getCurrentLocale();
        this.reddah.getUserPhotos(this.userName);
        if(locale==null){
            const changeLocaleModal = await this.modalController.create({
                component: LocalePage,
                componentProps: { orgLocale: locale }
            });
            
            await changeLocaleModal.present();
            const { data } = await changeLocaleModal.onDidDismiss();
            if(data){
                window.location.reload();
            }
        }

        this.articles = [];
        this.loadedIds = [];
        const loading = await this.loadingController.create({
            message: this.translateService.instant("Article.Loading"),
            spinner: 'circles',
        });
        await loading.present();

        let cacheKey = "this.reddah.getArticles" + JSON.stringify(this.loadedIds) + locale;
        let request = this.reddah.getArticles(this.loadedIds, locale, "promoted");

        this.cacheService.loadFromObservable(cacheKey, request)
        .subscribe(articles => 
        {
            for(let article of articles){
                this.articles.push(article);
                this.loadedIds.push(article.Id);  
            }
            loading.dismiss();
        });
    }
  
    getArticles():void {
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        if(locale==null)
            locale = "en-US"

        let cacheKey = "this.reddah.getArticles" + JSON.stringify(this.loadedIds) + locale;
        let request = this.reddah.getArticles(this.loadedIds, locale, "promoted");

        this.cacheService.loadFromObservable(cacheKey, request)
        .subscribe(articles => 
        {
            for(let article of articles){
            this.articles.push(article);
            this.loadedIds.push(article.Id);  
            }
        });
    }

    ionViewDidLoad() {
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        console.log(locale);
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

    async goSearch(){
        const userModal = await this.modalController.create({
            component: MyInfoPage,
            componentProps: { 
                userName: ''
            }
        });
          
        await userModal.present();
    }

}
