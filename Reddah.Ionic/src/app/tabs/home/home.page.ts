import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { Article } from '../../model/article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { PostviewerPage } from '../../postviewer/postviewer.page';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import { MyInfoPage } from '../../common/my-info/my-info.page';
import { SearchPage } from '../../common/search/search.page';
import { UserPage } from '../../common/user/user.page';
import { PubPage } from '../publisher/pub/pub.page';
import { ArticleDislikePopPage } from '../../common/article-dislike-pop.page';
import { AddFeedbackPage } from '../../mytimeline/add-feedback/add-feedback.page';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    @ViewChild('pageTop') pageTop: Content;
    
    userName: any;
    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        private popoverController: PopoverController,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        private translate:TranslateService,
    ){
        this.userName = this.reddah.getCurrentUser();
        this.reddah.articles = [];
        this.reddah.loadedIds = [];
        this.reddah.dislikeGroups = [];
        this.reddah.dislikeUserNames = [];
    }

    firstLoad = false;
    ngOnInit(){
        this.reddah.getUserPhotos(this.userName);

        let cacheArticles = this.localStorageService.retrieve("reddah_articles_"+this.userName);
        let cacheArticleIds = this.localStorageService.retrieve("reddah_article_ids_"+this.userName);
        let cacheDislikeGroups = this.localStorageService.retrieve("reddah_article_groups_"+this.userName);
        let cacheDislikeUserNames = this.localStorageService.retrieve("reddah_article_usernames_"+this.userName);
    
        
        if(cacheArticles){
            let top = 20;
            this.reddah.articles = JSON.parse(cacheArticles).slice(0,top);
            this.reddah.loadedIds = JSON.parse(cacheArticleIds).slice(0,top);
            this.reddah.dislikeGroups = JSON.parse(cacheDislikeGroups);
            this.reddah.dislikeUserNames = JSON.parse(cacheDislikeUserNames);
            this.reddah.fillCacheArticles();
        }
        else
        {
            this.firstLoad = true;
            let locale = this.reddah.getCurrentLocale();
            let cacheKey = "this.reddah.getArticles" + JSON.stringify(this.reddah.loadedIds)
                + JSON.stringify(this.reddah.dislikeGroups) + JSON.stringify(this.reddah.dislikeUserNames) 
                + locale;
            let request = this.reddah.getArticles(
                this.reddah.loadedIds, 
                this.reddah.dislikeGroups,
                this.reddah.dislikeUserNames,
                locale, "promoted");

            this.cacheService.loadFromObservable(cacheKey, request, "HomePage")
            .subscribe(articles => 
            {
                for(let article of articles){
                    this.reddah.articles.push(article);
                    this.reddah.loadedIds.push(article.Id);
                    if(!this.reddah.publishers.has(article.UserName))
                    {
                        this.reddah.publishers.add(article.UserName);
                        this.reddah.getUserPhotos(article.UserName);
                    }
                }
                this.localStorageService.store("reddah_articles_"+this.userName, JSON.stringify(this.reddah.articles));
                this.localStorageService.store("reddah_article_ids_"+this.userName, JSON.stringify(this.reddah.loadedIds));
                this.localStorageService.store("reddah_article_groups_"+this.userName, JSON.stringify(this.reddah.dislikeGroups));
                this.localStorageService.store("reddah_article_usernames_"+this.userName, JSON.stringify(this.reddah.dislikeUserNames));
       
                this.reddah.fillCacheArticles();
                this.firstLoad = false;
            });
        }
       
    }
  
    

    //drag down
    dragDown(event){
        this.getCacheArticles(event, true);
    }

    //drag up
    loadData(event) {
        this.getCacheArticles(event);
    }

    getCacheArticles(event, unshift=false):void {
        if(this.reddah.ArticleCacheQueue.length()==0){
            setTimeout(()=>{
                this.getCacheArticles(event, unshift);
            },1000)
        }
        else{
            let count = 10;
            for(let i=1;i<=count;i++){
                let article = this.reddah.ArticleCacheQueue.pop();
                if(article!=null){
                    if(unshift){
                        this.reddah.articles.unshift(article);
                        this.reddah.loadedIds.unshift(article.Id);  
                    }
                    else{
                        this.reddah.articles.push(article);
                        this.reddah.loadedIds.push(article.Id);  
                    }
                }
            }
            this.localStorageService.store("reddah_cache_queue_"+this.userName, JSON.stringify(this.reddah.ArticleCacheQueue));
            this.localStorageService.store("reddah_articles_"+this.userName, JSON.stringify(this.reddah.articles));

            if(event){
                event.target.complete();
            }
            this.reddah.fillCacheArticles();
            
        }
    }    

    async myInfo() {
        const myInfoModal = await this.modalController.create({
            component: MyInfoPage,
            componentProps: {  },
            cssClass: "modal-fullscreen",
        });
        
        await myInfoModal.present();
        const { data } = await myInfoModal.onDidDismiss();
        //check if change
        if(data)
            this.reddah.getUserPhotos(this.userName);
    }
    
    async view(article: Article){
        this.reddah.reloadLocaleSettings();
        const viewerModal = await this.modalController.create({
            component: PostviewerPage,
            componentProps: { article: article },
            cssClass: "modal-fullscreen",
        });
        
        await viewerModal.present();
        this.localStorageService.store("reddah_articles_"+this.userName, JSON.stringify(this.reddah.articles));
        const { data } = await viewerModal.onDidDismiss();
        if(data||!data){   
            article.Read = true;
        }
    }

    async goSearch(key){
        const modal = await this.modalController.create({
            component: SearchPage,
            componentProps: { 
                key: key,
                type: 0,//article only
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    async goUser(userName){
        let isNormalUser = true;
        if(userName.length==32)
            isNormalUser = false;

        const modal = await this.modalController.create({
            component: isNormalUser?UserPage:PubPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }
    
    async dislike(event, article){
        let reasons = [
            [{Id:1, Title:this.translate.instant("Pop.SawIt"), Key:"" },{Id:2, Title:this.translate.instant("Pop.Trash"), Key:""}],
        ];
        reasons.push([
            {Id:4, Title:this.translate.instant("Pop.Porn"), Key:"" },
            {Id:5, Title:`${this.translate.instant("Pop.NoAuthor")}:${this.reddah.getDisplayName(article.UserName)}`, Key:article.UserName } ]);
        
        let startIndex = 100;
        let group = article.GroupName.split(',');
        let dislikeGroup = [];
        for(let i=0;i<2;i++){
            let last = group.slice(-1).pop();
            if(last)
            {
                group.splice(group.length-1, 1);
                dislikeGroup.unshift({Id:startIndex, Title:`${this.translate.instant("Pop.Dislike")}:${last}`, Key: last});
                startIndex++;
            }
        }
        reasons.push(dislikeGroup);

        const popover = await this.popoverController.create({
            component: ArticleDislikePopPage,
            componentProps: { Reasons: reasons },
            //event: event,
            translucent: true,
            animated: false,
            //enterAnimation: "am-fade",
            cssClass: 'article-dislike-popover',
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data!=null)
        {
            //UI remove 
            if(data.Id!=-1){
                this.reddah.articles.forEach((item, index)=>{
                    if(item.Id==article.Id)
                        this.reddah.articles.splice(index, 1);
                })
            }
            

            //parameter
            if(data.Id==5){
                this.reddah.dislikeUserNames.push(data.Key);
                this.localStorageService.store("reddah_article_usernames_"+this.userName, JSON.stringify(this.reddah.dislikeUserNames));
                //ui delete
                this.reddah.articles.forEach((item, index)=>{
                    if(item.UserName==article.UserName)
                        this.reddah.articles.splice(index, 1);
                })
            }
            if(data.Id>10){
                this.reddah.dislikeGroups.push(data.Key);
                this.localStorageService.store("reddah_article_groups_"+this.userName, JSON.stringify(this.reddah.dislikeGroups));
                //ui delete
                this.reddah.articles.forEach((item, index)=>{
                    if(item.GroupName.indexOf(data.Key+",")||
                    item.GroupName.indexOf(","+data.Key+",")|| 
                    item.GroupName.indexOf(","+data.Key))
                        this.reddah.articles.splice(index, 1);
                })
            }

            //cache remove
            this.localStorageService.store("reddah_articles_"+this.userName, JSON.stringify(this.reddah.articles));
            
            //sys report
            //further, flink analytics etc.

            if(data.Id==-1)
                this.feedback(article)
        }
        
    }

    async feedback(article) {
        const modal = await this.modalController.create({
            component: AddFeedbackPage,
            componentProps: { 
                title: this.translate.instant("Pop.Report"),
                desc: this.translate.instant("Pop.ReportReason"),
                feedbackType: 4,
                article: article
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data==true)
        {
            this.reddah.articles.forEach((item, index)=>{
                if(item.Id==article.Id)
                    this.reddah.articles.splice(index, 1);
            })
        }
    }
}
