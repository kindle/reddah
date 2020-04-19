import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { ReddahService } from '../../reddah.service';
import { Article } from "../../model/article";
import { PostviewerPage } from '../../postviewer/postviewer.page';
import { StockPage } from '../stock/stock.page';
import { TsViewerPage } from '../../mytimeline/tsviewer/tsviewer.page';
import { PubPage } from '../../tabs/publisher/pub/pub.page';
import { MiniViewerComponent } from '../mini-viewer/mini-viewer.component';
import { ActivatedRoute } from '@angular/router';
import { AddFeedbackPage } from '../../mytimeline/add-feedback/add-feedback.page';
import { ShareChooseChatPage } from '../../chat/share-choose-chat/share-choose-chat.page';
import { AddFriendPage } from '../../friend/add-friend/add-friend.page';

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
    keywordPlaceholder = this.reddah.instant("Search.Title");

    topics = [
        [
            {id:1,name:this.reddah.instant("Menu.Recommend")},
            {id:2,name:this.reddah.instant("Menu.Timeline")},
            {id:3,name:this.reddah.instant("Menu.Publisher")}
        ],
        [
            {id:4,name:this.reddah.instant("Menu.MiniApp")},
            {id:5,name:this.reddah.instant("Menu.Contact")},
            {id:6,name:this.reddah.instant("Menu.Equity")}
        ],
        /*,{id:5,name:'聊天记录'},*/
    ];

    async chooseTopic(col, isSetFocus=true){
        this.showTopic = false;
        this.keywordPlaceholder = col.name;
        this.selectedTopicId = col.id;
        if(isSetFocus){
            //setTimeout(() => {
            //    this.searchKeyword.setFocus();
            //},150);
        }

        if(col.id==3){
            this.loadRecentPub();
        }
        else if(col.id==4){
            this.loadRecentMini();
            this.loadSuggestMini();
        }
        else if(col.id==5){
            this.close();
            const addFriendModal = await this.modalController.create({
                component: AddFriendPage,
                componentProps: {},
                cssClass: "modal-fullscreen",
            });

            await addFriendModal.present();
        }
    }

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private cacheService: CacheService,
        public navController: NavController,
        private router: ActivatedRoute,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
        this.type = this.router.snapshot.queryParams["type"];

        this.articleHistories = this.reddah.getHistory(1);
        this.apertureHistories = this.reddah.getHistory(2);
    }



    @ViewChild('searchKeyword') searchKeyword;
    searchKeywordModel;
    @ViewChild('searchResult') searchResult;

    firstLoading_a = false;
    firstLoading_t = false;
    firstLoading_p = false;
    firstLoading_m = false;

    ngOnInit() {
        if(this.type==-1||this.type==null){//come from search user 404 this.type==-1
            if(this.key){
                this.searchKeywordModel = this.key;
                this.search();
            }
            else{
                //setTimeout(() => {
                //    this.searchKeyword.setFocus();
                //},150);
            }
        }        
        else{//from clicking article label, search publisher
            if(this.key){
                this.chooseTopic([].concat.apply([],this.topics)[this.type], false);
                this.searchKeywordModel = this.key;
                this.search();
            }
            else{
                this.chooseTopic([].concat.apply([],this.topics)[this.type]);
            }
            
        }
        
    }

    async more(type){
        this.locale = this.reddah.getCurrentLocale();
        this.key = this.searchKeywordModel;
        this.type = type;
        this.ngOnInit(); 

    }

    async close() {
        // close modal
        try {
            const element = await this.modalController.getTop();
            if (element) {
                element.dismiss();
                return;
            }
        } catch (error) {
        }
        this.navController.back();
    }

    async onSearchchange(){
        if(this.searchKeywordModel.length==0)
        {
            this.users_p = [];
            this.users_m = [];

            return;
        }
    }


    articleHistories=[];
    apertureHistories=[];

    searchHistory(value){
        this.searchKeywordModel = value;
        this.search();
    }

    clearHistory(id){
        if(id==1)
            this.articleHistories = [];
        if(id==2)
            this.apertureHistories = [];

        if(id==1||id==2)
            this.reddah.clearHistory(id);
    }

    async search(){

        this.showTopic = false;
        
        if(this.selectedTopicId==1)//article
        {
            this.firstLoading_a = true;
            this.loadedIds_a=[];
            this.articles_a=[];
            this.searchArticles(null);

            this.reddah.refreshHistoryCache(this.articleHistories, this.searchKeywordModel, 1);
        }
        else if(this.selectedTopicId==2)//timeline/aperture
        {
            this.firstLoading_t = true;
            this.loadedIds_t=[];
            this.articles_t=[];
            this.searchTimelines(null);

            this.reddah.refreshHistoryCache(this.apertureHistories, this.searchKeywordModel, 2);
        }
        else if(this.selectedTopicId==3)//publisher
        {
            this.firstLoading_p = true;
            this.loadedIds_p=[];
            this.users_p=[];
            this.searchPublisher(null);
        }
        else if(this.selectedTopicId==4)//mini
        {
            this.firstLoading_m = true;
            this.loadedIds_m=[];
            this.users_m=[];
            this.searchMini(null);
        }
        else if(this.selectedTopicId==5)//contact
        {
            //alert('todo')
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

    users_m_recent=[];
    loadRecentMini(){
        this.users_m_recent = this.reddah.loadRecent(4);
    }

    users_p_recent=[];
    loadRecentPub(){
        this.users_p_recent = this.reddah.loadRecent(3);
    }

    users_p_suggest=[];
    loadSuggestMini(){
        let recentList = this.reddah.loadRecent(4).map(x=>x.UserName);
        let cacheKey = "this.reddah.getSuggestMinis";
        //let request = this.reddah.getSuggestMinis();

        //this.cacheService.loadFromObservable(cacheKey, request, "SearchPage")
        this.reddah.getSuggestMinis()
        .subscribe(data=>{
            
            data.forEach((item, index, alias)=>{
                if(recentList.indexOf(item.UserName)>-1){
                    item.isRecent = true;
                }
                this.reddah.getUserPhotos(item.UserName);
            });

            this.users_p_suggest = data.filter(x=>!x.isRecent);

        })
    }

    locale;

    loadedIds_a=[];
    articles_a=[];
    async searchArticles(event, limit=10000){
        this.locale = this.reddah.getCurrentLocale();
        let cacheKey = "this.reddah.searchArticles" + JSON.stringify(this.loadedIds_a) + this.locale + "search_article"+this.searchKeywordModel;
        let request = this.reddah.getArticles(this.loadedIds_a, [], [], this.locale, "search", this.searchKeywordModel, 1, "", 0);
        //console.log(cacheKey);
        this.cacheService.loadFromObservable(cacheKey, request, "SearchPage")
        .subscribe(articles => 
        {
            let i=0;
            for(let article of articles){
                if(i<limit)
                {
                    this.articles_a.push(article);
                    this.loadedIds_a.push(article.Id);  
                    if(!this.reddah.publishers.has(article.UserName))
                    {
                        this.reddah.publishers.add(article.UserName);
                        this.reddah.getUserPhotos(article.UserName);
                    }
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
        this.locale = this.reddah.getCurrentLocale();
        let cacheKey = "this.reddah.searchTimelines" + JSON.stringify(this.loadedIds_t) + this.locale + "search_timeline"+this.searchKeywordModel;
        //status=0 as there's no draft for timeline
        let request = this.reddah.getArticles(this.loadedIds_t, [], [], this.locale, "search", this.searchKeywordModel, 0, "", 1);
        
        this.cacheService.loadFromObservable(cacheKey, request, "SearchPage")
        .subscribe(articles => 
        {
            let i=0;
            for(let article of articles){
                if(i<limit)
                {
                    this.articles_t.push(article);
                    this.loadedIds_t.push(article.Id);  
                    if(!this.reddah.publishers.has(article.UserName))
                    {
                        this.reddah.publishers.add(article.UserName);
                        this.reddah.getUserPhotos(article.UserName);
                    }
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

    loadedIds_p=[];
    users_p=[];
    async searchPublisher(event, limit=10000){
        this.locale = this.reddah.getCurrentLocale();
        let cacheKey = "this.reddah.searchPublisher" + JSON.stringify(this.loadedIds_p) + this.locale + "search_publisher"+this.searchKeywordModel;
        let formData = new FormData();
        formData.append("key", this.searchKeywordModel);
        formData.append("loadedIds", JSON.stringify(this.loadedIds_p));
        formData.append("type", JSON.stringify(1));
        let request = this.reddah.getPublishers(formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "SearchPage")
        .subscribe(pubs => 
        {
            let i=0;
            for(let pub of pubs){
                if(i<limit)
                {
                    this.users_p.push(pub);
                    this.loadedIds_p.push(pub.UserId);  
                    i++;
                }
                else
                    break;
            }
            if(event)
                event.target.complete();
            this.firstLoading_p = false;
        });
    }

    loadedIds_m=[];
    users_m=[];
    async searchMini(event, limit=10000){
        this.locale = this.reddah.getCurrentLocale();
        let cacheKey = "this.reddah.searchMini" + JSON.stringify(this.loadedIds_m) + this.locale + "search_publisher"+this.searchKeywordModel;
        let formData = new FormData();
        formData.append("key", this.searchKeywordModel);
        formData.append("loadedIds", JSON.stringify(this.loadedIds_m));
        formData.append("type", JSON.stringify(3));
        let request = this.reddah.getPublishers(formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "SearchPage")
        .subscribe(pubs => 
        {
            let i=0;
            for(let pub of pubs){
                if(i<limit)
                {
                    this.users_m.push(pub);
                    this.loadedIds_m.push(pub.UserId);  
                    i++;
                }
                else
                    break;
            }
            if(event)
                event.target.complete();
            this.firstLoading_m = false;
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
            componentProps: { article: article },
            cssClass: "modal-fullscreen",
        });
        
        await viewerModal.present();
        const { data } = await viewerModal.onDidDismiss();
        if(data){
            //console.log(data)
        }

    }

    async viewStock(){
        const stockModal = await this.modalController.create({
            component: StockPage,
            componentProps: { s: this.searchKeywordModel },
            cssClass: "modal-fullscreen",
        });
        
        await stockModal.present();
    }

    async goTsViewer(article){
        const userModal = await this.modalController.create({
            component: TsViewerPage,
            componentProps: { 
                article: article
            },
            cssClass: "modal-fullscreen",
        });
        
        await userModal.present();
    }

    async goPub(pub){
        this.reddah.setRecent(pub,3);
        const modal = await this.modalController.create({
            component: PubPage,
            componentProps: { 
                userName: pub.UserName
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data||!data)
        {
            
        }
    }

    
    async goMini(mini){
        
        //open mini page
        const modal = await this.modalController.create({
            component: MiniViewerComponent,
            componentProps: { 
                content: mini.Cover,
                guid: mini.UserName,
                //version: mini.Sex,//always use the latest version
                version: this.reddah.appData('usersex_'+mini.UserName)
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data||!data)
        {
            if(data=='report'){
                const modal = await this.modalController.create({
                    component: AddFeedbackPage,
                    componentProps: { 
                        title: this.reddah.instant("Pop.Report"),
                        desc: this.reddah.instant("Pop.ReportReason"),
                        feedbackType: 4,
                        article: mini
                    },
                    cssClass: "modal-fullscreen",
                });
                  
                await modal.present();
            }
            else if(data=='share'){
                const modal = await this.modalController.create({
                    component: ShareChooseChatPage,
                    componentProps: { 
                        title: this.reddah.instant("Common.Choose"),
                        article: mini,
                    },
                    cssClass: "modal-fullscreen",
                });
                  
                await modal.present();        
            }
        }

        this.reddah.setRecent(mini,4);
        this.reddah.setRecentUseMini(mini.UserName).subscribe(data=>{});
    }

}
