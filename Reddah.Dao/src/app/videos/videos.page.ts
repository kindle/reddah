import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ReddahService } from '../reddah.service';
import { LoadingController, NavController, ModalController, IonSlides } from '@ionic/angular';
//import { LocalStorageService } from 'ngx-webstorage';
//import { CacheService } from 'ionic-cache';

@Component({
    selector: 'app-videos',
    templateUrl: 'videos.page.html',
    styleUrls: ['videos.page.scss']
})
export class VideosPage implements OnInit {

    userName: any;

    close(){
        this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        public modalController: ModalController, 
        //private localStorageService: LocalStorageService,
        //private cacheService: CacheService,
    ){
        //this.userName = this.reddah.getCurrentUser();
        
        
    }

    slideOpts;

    ngOnInit(){
        this.reddah.videoArticles.push({id:"video1", src:"assets/video/balloons.mp4", userName: "duowen"});
        this.reddah.videoArticles.push({id:"video2", src:"assets/video/ref.mp4", userName: "zixian"});
        this.slideOpts = {
            pager: false,
            direction: 'vertical',
            centeredSlides: 'true',
            initialSlide: 0,
            zoom: true,
            spaceBetween: 0,
            effect: 'flip',
        };

        /*
        let cacheVideoArticles = this.localStorageService.retrieve("reddah_video_articles_"+this.userName);
        let cacheVideoArticleIds = this.localStorageService.retrieve("reddah_video_article_ids_"+this.userName);
        let cacheVideoDislikeGroups = this.localStorageService.retrieve("reddah_video_article_groups_"+this.userName);
        let cacheVideoDislikeUserNames = this.localStorageService.retrieve("reddah_video_article_usernames_"+this.userName);
    
        let cacheVideoArticleArray = JSON.parse(cacheVideoArticles);
        if(cacheVideoArticles&&cacheVideoArticleArray.length>0){
            let top = 20;
            this.reddah.videoArticles = cacheVideoArticleArray.slice(0,top);
            //console.log(this.reddah.articles)
            this.reddah.videoArticles.forEach(article=>{
                article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)
            });
            this.reddah.videoLoadedIds = JSON.parse(cacheVideoArticleIds).slice(0,top);
            this.reddah.videoDislikeGroups = JSON.parse(cacheVideoDislikeGroups);
            this.reddah.videoDislikeUserNames = JSON.parse(cacheVideoDislikeUserNames);
            this.reddah.fillCacheVideos();
        }
        else
        {
            //this.firstLoad = true;
            let locale = "";//this.reddah.getCurrentLocale();
            let cacheKey = "this.reddah.getVideoArticles" + JSON.stringify(this.reddah.videoLoadedIds)
                + JSON.stringify(this.reddah.videoDislikeGroups) + JSON.stringify(this.reddah.videoDislikeUserNames) 
                + locale;
            let request = this.reddah.getArticles(
                this.reddah.videoLoadedIds, 
                this.reddah.videoDislikeGroups,
                this.reddah.videoDislikeUserNames,
                locale, "promoted", "", 1, "", 12);

            this.cacheService.loadFromObservable(cacheKey, request, "VideoPage")
            .subscribe(articles => 
            {
                for(let article of articles){
                    this.reddah.videoArticles.push(article);
                    //this.reddah.toFileCache(article.Content, true);
                    this.reddah.videoLoadedIds.push(article.Id);
                    if(!this.reddah.publishers.has(article.UserName))
                    {
                        this.reddah.publishers.add(article.UserName);
                        this.reddah.getUserPhotos(article.UserName);
                    }
                }
                this.localStorageService.store("reddah_video_articles_"+this.userName, JSON.stringify(this.reddah.videoArticles));
                this.localStorageService.store("reddah_video_article_ids_"+this.userName, JSON.stringify(this.reddah.videoLoadedIds));
                this.localStorageService.store("reddah_video_article_groups_"+this.userName, JSON.stringify(this.reddah.videoDislikeGroups));
                this.localStorageService.store("reddah_video_article_usernames_"+this.userName, JSON.stringify(this.reddah.videoDislikeUserNames));
        
                this.reddah.fillCacheVideos();
                //this.firstLoad = false;
            });
        }
        */

    }

    async getCacheVideoArticles(event, unshift=false) {
        /*
        if(this.reddah.ArticleCacheQueue==null||this.reddah.ArticleCacheQueue.length()==0){
            setTimeout(()=>{
                this.getCacheVideoArticles(event, unshift);
            },1000)
        }
        else{
            setTimeout(()=>{  
                let count = 10;
                for(let i=1;i<=count;i++){
                    let article = this.reddah.VideoArticleCacheQueue.pop();
                    if(article!=null){
                        if(unshift){
                            this.reddah.videoArticles.unshift(article);
                            this.reddah.videoLoadedIds.unshift(article.Id);  
                        }
                        else{
                            this.reddah.videoArticles.push(article);
                            this.reddah.videoLoadedIds.push(article.Id);  
                        }
                    }
                }
                this.localStorageService.store("reddah_video_cache_queue_"+this.userName, JSON.stringify(this.reddah.VideoArticleCacheQueue._store));
                this.localStorageService.store("reddah_video_articles_"+this.userName, JSON.stringify(this.reddah.videoArticles));
  
                if(event){
                    //event.target.complete();
                }
                this.reddah.fillCacheVideos();
            },1000)
            
        }
        */
    }    

    toggleVideo(event){
        if(event.srcElement.paused)
            event.srcElement.play();
        else
            event.srcElement.pause();
    }


    @ViewChild(IonSlides) slides: IonSlides;
    lastElement;
    
    ionSlidesDidLoad(){
        if(this.reddah.videoArticles.length>0){
            this.lastElement = document.getElementById(this.reddah.videoArticles[0].Id) as HTMLElement;
            this.lastElement.play();
        }
    }

    ionSlideWillChange(){
        this.slides.getActiveIndex().then(index=>
        {
            if(this.lastElement!=null){
                this.lastElement.pause();
                this.lastElement.currentTime = 0;
            }

            this.lastElement = document.getElementById(this.reddah.videoArticles[index].Id) as HTMLElement;
            this.lastElement.play();
        });

        this.getCacheVideoArticles(event);
    }

    more(){
        
    }

}
