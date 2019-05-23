import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';
import { Article } from "../article";
import { PostviewerPage } from '../postviewer/postviewer.page';

@Component({
    selector: 'app-search',
    templateUrl: './search.page.html',
    styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

    userName: string;

    showTopic=true;
    selectedTopicId=0;

    topics = [
        [{id:1,name:'文章'},{id:2,name:'朋友圈'},{id:3,name:'好友'}],
        [{id:4,name:'公众号'},{id:5,name:'小程序'},{id:6,name:'表情'}],
    ];

    chooseTopic(col){
        this.showTopic = false;
        this.searchKeyword.placeholder += col.name;
        this.selectedTopicId = col.id;
        setTimeout(() => {
            this.searchKeyword.setFocus();
        },150);
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

    firstLoading = false;

    async ngOnInit() {
        setTimeout(() => {
            this.searchKeyword.setFocus();
        },150);
    }

    async close() {
        await this.modalController.dismiss();
    }

    async search(){
        this.firstLoading = true;
        this.showTopic = false;
        this.loadedIds=[];
        this.articles=[];
        if(this.selectedTopicId==1)//article
        {
            this.searchArticles(null);
        }
        else if(this.selectedTopicId==2)//timeline
        {
            this.searchTimelines(null);
        }
        else
        {
                
        }
    }

    locale;
    loadedIds=[];
    articles=[];
    
    async searchArticles(event){
        
        let cacheKey = "this.reddah.searchArticles" + JSON.stringify(this.loadedIds) + this.locale + "search"+this.searchKeyword.value;
        let request = this.reddah.getArticles(this.loadedIds, this.locale, "search", this.searchKeyword.value, 0);
        console.log(cacheKey);
        this.cacheService.loadFromObservable(cacheKey, request, "SearchPage")
        .subscribe(articles => 
        {
            for(let article of articles){
                this.articles.push(article);
                this.loadedIds.push(article.Id);  
            }
            if(event)
                event.target.complete();
            this.firstLoading = false;
        });
    }

    async searchTimelines(event){
        
        let cacheKey = "this.reddah.searchTimelines" + JSON.stringify(this.loadedIds) + this.locale + "search"+this.searchKeyword.value;
        let request = this.reddah.getArticles(this.loadedIds, this.locale, "search", this.searchKeyword.value, 1);
        console.log(cacheKey);
        this.cacheService.loadFromObservable(cacheKey, request, "SearchPage")
        .subscribe(articles => 
        {
            for(let article of articles){
                this.articles.push(article);
                this.loadedIds.push(article.Id);  
            }
            if(event)
                event.target.complete();
            this.firstLoading = false;
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

    async viewTs(article){

    }

}
