import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';

import { ReddahService } from '../../reddah.service';
import { Article } from "../../model/article";
import { PostviewerPage } from '../../postviewer/postviewer.page';
import { StockPage } from '../stock/stock.page';
import { NgOnChangesFeature } from '@angular/core/src/render3';
import { TsViewerPage } from '../../mytimeline/tsviewer/tsviewer.page';

@Component({
    selector: 'app-search',
    templateUrl: './search.page.html',
    styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

    @Input() key: string;
    @Input() type: number;

    userName: string;

    showTopic=true;
    selectedTopicId=0;

    topics = [
        [{id:1,name:'文章'},{id:2,name:'朋友圈'},{id:3,name:'好友'}],
        [{id:4,name:'公众号'},{id:5,name:'小程序'},{id:6,name:'股票'}],
    ];

    chooseTopic(col, isSetFocus=true){
        this.showTopic = false;
        this.searchKeyword.placeholder += col.name;
        this.selectedTopicId = col.id;
        if(isSetFocus){
            setTimeout(() => {
                this.searchKeyword.setFocus();
            },150);
        }
    }

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }

    @ViewChild('searchKeyword') searchKeyword;
    @ViewChild('searchResult') searchResult;

    firstLoading_a = false;
    firstLoading_t = false;

    async ngOnInit() {
        if(this.key&&this.type!=-1){//come from clicking article label
            this.chooseTopic([].concat.apply([],this.topics)[this.type], false);
            this.searchKeyword.value = this.key;
            this.search();
        }
        else if(this.type==-1){//come from search user 404
            this.searchKeyword.value = this.key;
            this.search();
        }
        else{
            setTimeout(() => {
                this.searchKeyword.setFocus();
            },150);
        }
    }

    async more(type){
        this.key = this.searchKeyword.value;
        this.type = type;
        this.ngOnInit(); 

    }

    async close() {
        await this.modalController.dismiss();
    }

    async search(){
        
        this.showTopic = false;
        
        if(this.selectedTopicId==1)//article
        {
            this.firstLoading_a = true;
            this.loadedIds_a=[];
            this.articles_a=[];
            this.searchArticles(null);
        }
        else if(this.selectedTopicId==2)//timeline
        {
            this.firstLoading_t = false;
            this.loadedIds_t=[];
            this.articles_t=[];
            this.searchTimelines(null);
        }
        else if(this.selectedTopicId==6)//stock chart
        {
            this.viewStock();
        }
        else
        {
            //article
            this.firstLoading_a = true;
            this.loadedIds_a=[];
            this.articles_a=[];
            this.searchArticles(null, 3);
            //timeline
            this.firstLoading_t = false;
            this.loadedIds_t=[];
            this.articles_t=[];
            this.searchTimelines(null, 3);
        }
    }

    locale;

    loadedIds_a=[];
    articles_a=[];
    async searchArticles(event, limit=10000){
        
        let cacheKey = "this.reddah.searchArticles" + JSON.stringify(this.loadedIds_a) + this.locale + "search_article"+this.searchKeyword.value;
        let request = this.reddah.getArticles(this.loadedIds_a, this.locale, "search", this.searchKeyword.value, 0);
        console.log(cacheKey);
        this.cacheService.loadFromObservable(cacheKey, request, "SearchPage")
        .subscribe(articles => 
        {
            let i=0;
            for(let article of articles){
                if(i<limit)
                {
                    this.articles_a.push(article);
                    this.loadedIds_a.push(article.Id);  
                    i++;
                }
                else
                    break;
            }
            if(event)
                event.target.complete();
            this.firstLoading_a = false;
        });
    }

    loadedIds_t=[];
    articles_t=[];
    async searchTimelines(event, limit=10000){
        
        let cacheKey = "this.reddah.searchTimelines" + JSON.stringify(this.loadedIds_t) + this.locale + "search_timeline"+this.searchKeyword.value;
        let request = this.reddah.getArticles(this.loadedIds_t, this.locale, "search", this.searchKeyword.value, 1);
        
        this.cacheService.loadFromObservable(cacheKey, request, "SearchPage")
        .subscribe(articles => 
        {
            let i=0;
            for(let article of articles){
                if(i<limit)
                {
                    this.articles_t.push(article);
                    this.loadedIds_t.push(article.Id);  
                    i++;
                }
                else
                    break;
            }
            if(event)
                event.target.complete();
            this.firstLoading_t = false;
        });
    }

    loadData(event) {
        if(this.selectedTopicId==1)//article
        {
            this.searchArticles(event);
        }
        else if(this.selectedTopicId==2)//timeline
        {
            this.searchTimelines(event);
        }
        else
        {

        }
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

    async viewStock(){
        const stockModal = await this.modalController.create({
            component: StockPage,
            componentProps: { s: this.searchKeyword.value }
        });
        
        await stockModal.present();
    }

    async goTsViewer(article){
        const userModal = await this.modalController.create({
            component: TsViewerPage,
            componentProps: { 
                article: article
            }
        });
        
        await userModal.present();
    }

}
