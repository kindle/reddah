import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, IonContent, IonRefresher, ActionSheetController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { Article } from '../../model/article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { PostviewerPage } from '../../postviewer/postviewer.page';
import { CacheService } from "ionic-cache";
import { MyInfoPage } from '../../common/my-info/my-info.page';
import { SearchPage } from '../../common/search/search.page';
import { UserPage } from '../../common/user/user.page';
import { PubPage } from '../publisher/pub/pub.page';
import { AddTimelinePage } from 'src/app/mytimeline/add-timeline/add-timeline.page';
import { MyTimeLinePage } from 'src/app/mytimeline/mytimeline.page';
import { MessageListPage } from '../message/message.page';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {

    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

    userName: any;
    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        private popoverController: PopoverController,
        private actionSheetController: ActionSheetController,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        //private translate:TranslateService,
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
    
        let cacheArticleArray = JSON.parse(cacheArticles);
        if(cacheArticles&&cacheArticleArray.length>0){
            let top = 20;
            this.reddah.articles = JSON.parse(cacheArticles).slice(0,top);
            this.reddah.articles.forEach(article=>{
                article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)
            });
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

    getGroupNames(groupName){
        let names = groupName.split(',').filter(x=>x.trim().length>0)
        return names.slice(-1);
        /*if(names.length>0){
            return names.length==1? names[0]: names.slice(-1);
        }
        return [];*/
    }

    showSearchBar = false;
    lastScrollTop;
    async onScroll($event){


        console.log(this.reddah.unReadMessage)
        let currentScrollTop = $event.detail.scrollTop;
        if(currentScrollTop > this.lastScrollTop){
            //this.direction = 'down';
            this.showSearchBar = false;
        }else{
            //this.direction = 'up';
            this.showSearchBar = true;
        }
        
        this.lastScrollTop = currentScrollTop;
    }
  
    async create(){
        const actionSheet = await this.actionSheetController.create({
            //header: this.reddah.instant('Pop.YourThoughts'),
            buttons: [{
                text: this.reddah.instant('Menu.Recommend'),
                role: 'destructive',
                icon: 'create-outline',
                handler: () => {
                    
                }
            }, {
                text: this.reddah.instant('Pop.TakePhoto'),
                icon: 'camera-outline',
                role: 'destructive',
                handler: () => {
                    this.goPost(1);
                }
            }, {
                text: this.reddah.instant('Pop.SelectPhoto'),
                icon: 'image-outline',
                role: 'destructive',
                handler: () => {
                    this.goPost(2);
                }
            }]
        });
        await actionSheet.present();
        
    }

    async goPost(postType){
        const postModal = await this.modalController.create({
            component: AddTimelinePage,
            componentProps: { postType: postType },
            cssClass: "modal-fullscreen",
        });
          
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            this.doRefresh(null);
        }
    }

    //drag down
    doRefresh(event){
        this.getCacheArticles(event, true);
    }

    //drag up
    loadData(event) {
        this.getCacheArticles(event);
    }

    async getCacheArticles(event, unshift=false) {
        if(this.reddah.ArticleCacheQueue==null||this.reddah.ArticleCacheQueue.length()==0){
            setTimeout(()=>{
                this.getCacheArticles(event, unshift);
            },1000)
        }
        else{
            setTimeout(()=>{  
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
                this.localStorageService.store("reddah_cache_queue_"+this.userName, JSON.stringify(this.reddah.ArticleCacheQueue._store));
                this.localStorageService.store("reddah_articles_"+this.userName, JSON.stringify(this.reddah.articles));

                if(event){
                    event.target.complete();
                    this.reddah.toast(
                        `${this.reddah.instant('Pop.SysUpdate').replace("{0}",count)}`, 
                        "primary",
                        "toast-update"
                        )
                }
                this.reddah.fillCacheArticles();
            },1000)
            
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

    async goSearch(key=''){
        const modal = await this.modalController.create({
            component: SearchPage,
            componentProps: { 
                key: key,
                //type: 0,//article only
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    async goMessage(){
        const modal = await this.modalController.create({
            component: MessageListPage,
            componentProps: {
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
    

}
