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

    articles = [];
    loadedIds = [];
    dislikeGroups = [];
    dislikeUserNames = [];

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
    ){
        this.userName = this.reddah.getCurrentUser();
    }

    async ngOnInit(){
        let cacheArticles = this.localStorageService.retrieve("reddah_articles");
        let cacheArticleIds = this.localStorageService.retrieve("reddah_article_ids");
        let cacheDislikeGroups = this.localStorageService.retrieve("reddah_article_groups");
        let cacheDislikeUserNames = this.localStorageService.retrieve("reddah_article_usernames");
        if(cacheArticles){
            this.articles = JSON.parse(cacheArticles);
            this.loadedIds = JSON.parse(cacheArticleIds);
            this.dislikeGroups = JSON.parse(cacheDislikeGroups);
            this.dislikeUserNames = JSON.parse(cacheDislikeUserNames);
        }
        else
        {
            let locale = this.reddah.getCurrentLocale();
            let cacheKey = "this.reddah.getArticles" + JSON.stringify(this.loadedIds)
                + JSON.stringify(this.dislikeGroups) + JSON.stringify(this.dislikeUserNames) 
                + locale;
            let request = this.reddah.getArticles(
                this.loadedIds, 
                this.dislikeGroups,
                this.dislikeUserNames,
                locale, "promoted");

            this.cacheService.loadFromObservable(cacheKey, request, "HomePage")
            .subscribe(articles => 
            {
                //console.log(articles);
                for(let article of articles){
                    this.articles.push(article);
                    this.loadedIds.push(article.Id);
                }
                this.localStorageService.store("reddah_articles", JSON.stringify(this.articles));
                this.localStorageService.store("reddah_article_ids", JSON.stringify(this.loadedIds));
                this.localStorageService.store("reddah_article_groups", JSON.stringify(this.dislikeGroups));
                this.localStorageService.store("reddah_article_usernames", JSON.stringify(this.dislikeUserNames));
                
            });
        }
    }
  
    getArticles(event, unshift=false):void {
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        if(locale==null)
            locale = "en-US"

        let cacheKey = "this.reddah.getArticles" + JSON.stringify(this.loadedIds)
            + JSON.stringify(this.dislikeGroups) + JSON.stringify(this.dislikeUserNames) 
            + locale;
        let request = this.reddah.getArticles(
            this.loadedIds, 
            this.dislikeGroups,
            this.dislikeUserNames,
            locale, "promoted");

        this.cacheService.loadFromObservable(cacheKey, request, "HomePage")
        .subscribe(articles => 
        {
            for(let article of articles){
                if(unshift){
                    this.articles.unshift(article);
                    this.loadedIds.unshift(article.Id);  
                }
                else{
                    this.articles.push(article);
                    this.loadedIds.push(article.Id);  
                }
            }
            this.localStorageService.store("reddah_articles", JSON.stringify(this.articles));
            this.localStorageService.store("reddah_article_ids", JSON.stringify(this.loadedIds));
            this.localStorageService.store("reddah_article_groups", JSON.stringify(this.dislikeGroups));
            this.localStorageService.store("reddah_article_usernames", JSON.stringify(this.dislikeUserNames));
                
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
        this.localStorageService.clear("reddah_article_groups");
        this.localStorageService.clear("reddah_article_usernames");
            
        this.articles = [];
        this.loadedIds = [];
        this.dislikeGroups = [];
        this.dislikeUserNames = [];
        this.getArticles(event);
    }

    //drag down
    dragDown(event){
        this.getArticles(event, true);
    }

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
        article.Read = true;
        this.localStorageService.store("reddah_articles", JSON.stringify(this.articles));
        const { data } = await viewerModal.onDidDismiss();
        if(data){
            //console.log(data)
        }
    }

    async goSearch(key){
        const modal = await this.modalController.create({
            component: SearchPage,
            componentProps: { 
                key: key,
                type: 0,//article only
            }
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
            }
        });
          
        await modal.present();
    }
    
    async dislike(event, article){
        let reasons = [
            [{Id:1, Title:"看过了", Key:"" },{Id:2, Title:"内容太水", Key:""}],
        ];
        reasons.push([
            {Id:4, Title:`色情低俗`, Key:"" },
            {Id:5, Title:`拉黑作者:${this.reddah.getDisplayName(article.UserName)}`, Key:article.UserName } ]);
        
        let startIndex = 100;
        let group = article.GroupName.split(',');
        let dislikeGroup = [];
        for(let i=0;i<2;i++){
            let last = group.slice(-1).pop();
            if(last)
            {
                group.splice(group.length-1, 1);
                dislikeGroup.unshift({Id:startIndex, Title:`不看:${last}`, Key: last});
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
                this.articles.forEach((item, index)=>{
                    if(item.Id==article.Id)
                        this.articles.splice(index, 1);
                })
            }
            

            //parameter
            if(data.Id==5){
                this.dislikeUserNames.push(data.Key);
                this.localStorageService.store("reddah_article_usernames", JSON.stringify(this.dislikeUserNames));
                //ui delete
                this.articles.forEach((item, index)=>{
                    if(item.UserName==article.UserName)
                        this.articles.splice(index, 1);
                })
            }
            if(data.Id>10){
                this.dislikeGroups.push(data.Key);
                this.localStorageService.store("reddah_article_groups", JSON.stringify(this.dislikeGroups));
                //ui delete
                this.articles.forEach((item, index)=>{
                    if(item.GroupName.indexOf(data.Key+",")||
                    item.GroupName.indexOf(","+data.Key+",")|| 
                    item.GroupName.indexOf(","+data.Key))
                        this.articles.splice(index, 1);
                })
            }

            //cache remove
            this.localStorageService.store("reddah_articles", JSON.stringify(this.articles));
            
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
                title: "文章举报",
                desc: "请输入文章违规描述",
                feedbackType: 4,
                article: article
            }
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data==true)
        {
            this.articles.forEach((item, index)=>{
                if(item.Id==article.Id)
                    this.articles.splice(index, 1);
            })
        }
    }
}
