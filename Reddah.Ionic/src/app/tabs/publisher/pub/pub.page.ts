import { Component, OnInit, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController, ActionSheetController, NavParams, AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { ImageViewerComponent } from '../../../common/image-viewer/image-viewer.component';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SettingNoteLabelPage } from '../../../settings/setting-note-label/setting-note-label.page';
import { ChatPage } from '../../../chat/chat.page';
import { ChatFirePage } from '../../../chatfire/chat-fire.page';
import { Article } from '../../../model/article';
import { PostviewerPage } from '../../../postviewer/postviewer.page';
import { SearchPage } from '../../../common/search/search.page';
import { MorePage } from '../../../common/more/more.page';

@Component({
    selector: 'app-pub',
    templateUrl: 'pub.page.html',
    styleUrls: ['pub.page.scss']
})
export class PubPage implements OnInit {
    @Input() userName: string;

    articles = [];
    loadedIds = [];
    
    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    @ViewChild('pageTop') pageTop: Content;

    currentUserName;
    
    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        private renderer: Renderer,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private popoverController: PopoverController,
        private photoLibrary: PhotoLibrary,
        private cacheService: CacheService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        public actionSheetController: ActionSheetController,
        private navParams: NavParams,
        private alertController: AlertController,
    ){
        this.currentUserName = this.reddah.getCurrentUser();
        this.reddah.getUserPhotos(this.userName);
    }

    ngOnInit(){
        this.showLoading = true;
        let cacheArticles = this.localStorageService.retrieve("reddah_articles_"+this.userName);
        let cacheArticleIds = this.localStorageService.retrieve("reddah_article_ids_"+this.userName);
        if(cacheArticles){
            this.articles = JSON.parse(cacheArticles);
            this.loadedIds = JSON.parse(cacheArticleIds);
            this.showLoading = false;
        }
        else
        {
            let locale = this.reddah.getCurrentLocale();
            let cacheKey = "this.reddah.getArticles" + JSON.stringify(this.loadedIds) + locale + this.userName;
            let request = this.reddah.getArticles(this.loadedIds,[],[], locale, "search", this.userName);

            this.cacheService.loadFromObservable(cacheKey, request, "PubPage"+this.userName)
            .subscribe(articles => 
            {
                this.articles = [];
                this.loadedIds = [];
                for(let article of articles){
                    this.articles.push(article);
                    this.loadedIds.push(article.Id);
                }

                this.localStorageService.store("reddah_articles_"+this.userName, JSON.stringify(this.articles));
                this.localStorageService.store("reddah_article_ids_"+this.userName, JSON.stringify(this.loadedIds));
                this.showLoading = false;
            });
        }
    }

    
    showLoading=false;
    getArticles(event):void {
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        if(locale==null)
            locale = "en-US"

        let cacheKey = "this.reddah.getArticles" + JSON.stringify(this.loadedIds) + locale+this.userName;
        let request = this.reddah.getArticles(this.loadedIds,[],[], locale, "search", this.userName);

        this.cacheService.loadFromObservable(cacheKey, request, "PubPage"+this.userName)
        .subscribe(articles => 
        {
            this.articles = [];
            this.loadedIds = [];

            for(let article of articles){
                this.articles.push(article);
                this.loadedIds.push(article.Id);  
            }

            if(event){
                event.target.complete();
            }

            this.localStorageService.store("reddah_articles_"+this.userName, JSON.stringify(this.articles));
            this.localStorageService.store("reddah_article_ids_"+this.userName, JSON.stringify(this.loadedIds));
        });
    }   

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("PubPage"+this.userName);
        this.localStorageService.clear("reddah_articles_"+this.userName);
        this.localStorageService.clear("reddah_article_ids_"+this.userName);
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

    loadData(event) {
        this.getArticles(event);
    }

    async view(article: Article){
        const viewerModal = await this.modalController.create({
            component: PostviewerPage,
            componentProps: { article: article }
        });
        
        await viewerModal.present();
        const { data } = await viewerModal.onDidDismiss();
        if(data){
            //console.log(data)
        }

    }
    
    async close(isCloseParent=false){
        await this.modalController.dismiss(isCloseParent);
    }

    async presentActionSheet() {
        const actionSheet = await this.actionSheetController.create({
            //header: '',
            buttons: [{
              text: '更多信息',
              icon: 'ios-more',
              handler: () => {
                  this.goMore();
              }
            }
            ].concat(this.reddah.appData('userisfriend_'+this.userName+'_'+this.currentUserName)==1?
                [{
                    text: '分享给好友',
                    icon: 'share',
                    handler: () => {
                        //this.delCinfirm();                  
                    }
                }]:[]
            )
        });
        await actionSheet.present();
    }

    async goMore(){
        const modal = await this.modalController.create({
            component: MorePage,
            componentProps: { 
                pub: true
            }
        });
        
        await modal.present();
    }

    async delCinfirm(){
        const alert = await this.alertController.create({
          header: '删除确认',
          message: '确定要删除好友吗？',
          buttons: [
            {
                text: '取消',
                cssClass: 'secondary',
                handler: (blah) => {
                    
                }
            }, 
            {
                text: '删除',
                handler: () => {
                    let formData = new FormData();
                    formData.append("targetUser", this.userName);
                    this.reddah.removeFriend(formData).subscribe(data=>{
                        if(data.Success==0)
                            this.localStorageService.store(`userisfriend_${this.userName}_${this.currentUserName}`, 0);
                            //this.reddah.appPhoto[`userisfriend_${this.userName}_${this.currentUserName}`] = 0;
                            this.cacheService.clearGroup("ContactPage");
                            this.cacheService.clearGroup("TimeLinePage"+this.userName);
                            this.modalController.dismiss();
                    });
                }
            }
          ]
        });
    
        await alert.present();
    }

    async focus(){
        this.reddah.toTextCache(1, `userisfriend_${this.userName}_${this.currentUserName}`);
        let formData = new FormData();
        formData.append("targetUser",this.userName);
        this.reddah.setFocus(formData).subscribe(_=>{
            this.localStorageService.clear("Reddah_GroupedContacts_Pub");
            this.localStorageService.clear("Reddah_Contacts_Pub");
            this.cacheService.clearGroup("PubPage");
        });
    }

    async unfocus(){
        const alert = await this.alertController.create({
            header: "",
            message: `不再关注"${this.reddah.appData('usernickname_'+this.userName)}"后将不再收到其下发的消息`,
            buttons: [
              {
                text: "仍然关注",
                role: 'cancel',
                cssClass: 'dark',
                handler: () => {
                  
                }
              }, {
                text: "不再关注",
                cssClass:'danger',
                handler: () => {
                    this.actualUnfocus();
                }
              }
            ]
        });

        await alert.present().then(()=>{
            
        });
        
    }

    async actualUnfocus(){
        this.localStorageService.clear(`userisfriend_${this.userName}_${this.currentUserName}`);
        let formData = new FormData();
        formData.append("targetUser",this.userName);
        this.reddah.unFocus(formData).subscribe(_=>{
            this.localStorageService.clear("Reddah_GroupedContacts_Pub");
            this.localStorageService.clear("Reddah_Contacts_Pub");
            this.cacheService.clearGroup("PubPage");
        });
    }
  
    async viewer(photo) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
              imgSourceArray: [photo],
              imgTitle: "",
              imgDescription: ""
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true
        });
    
        return await modal.present();
    }

    async changeNoteName(){
        const modal = await this.modalController.create({
            component: SettingNoteLabelPage,
            componentProps: { 
                targetUserName: this.userName,
                currentNoteName: this.reddah.appData('usernotename_'+this.userName+'_'+this.currentUserName)
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data||!data)
            this.reddah.getUserPhotos(this.userName);
    }

    async chat(){
        const modal = await this.modalController.create({
            //component: ChatPage,
            component: ChatFirePage,
            componentProps: { 
                title: this.reddah.appData('usernotename_'+this.userName+'_'+this.currentUserName),
                target: this.userName,
                source: "pub"
                
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
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


    header: any;
    sticky: number;
    showTitle = false;
    onScroll($event)
    {
        let currentScrollTop = $event.detail.scrollTop;

        let header = document.getElementById("scrollTag");
        if(this.sticky==null)
            this.sticky = header.offsetTop;

        if ($event.detail.scrollTop > this.sticky) {
            this.showTitle = true;
        } else {
            this.showTitle = false;
        }
    }

}
