import { Component, OnInit, ViewChild, ElementRef, Input, Renderer2 } from '@angular/core';
import { IonInfiniteScroll, IonContent } from '@ionic/angular';
import { ReddahService } from '../../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController, ActionSheetController, NavParams, AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ImageViewerComponent } from '../../../common/image-viewer/image-viewer.component';
import { CacheService } from "ionic-cache";
import { SettingNoteLabelPage } from '../../../settings/setting-note-label/setting-note-label.page';
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
    
    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    @ViewChild('pageTop') pageTop: IonContent;

    currentUserName;
    
    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public actionSheetController: ActionSheetController,
        private alertController: AlertController,
        private translate: TranslateService,
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
            componentProps: { article: article },
            cssClass: "modal-fullscreen",
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
            buttons: []
            /*
            .concat(this.reddah.appData('userisfriend_'+this.userName+'_'+this.currentUserName)==1?
                [{
                    text: this.translate.instant("Pop.ToFriend"),
                    icon: 'share',
                    handler: () => {
                        //this.delCinfirm();                  
                    }
                }]:[]
            )*/
            .concat([
                {
                    text: this.translate.instant("Search.More"),
                    icon: 'ios-more',
                    handler: () => {
                        this.goMore();
                    }
                }
            ])
        });
        await actionSheet.present();
    }

    async goMore(){
        const modal = await this.modalController.create({
            component: MorePage,
            componentProps: { 
                pub: true,
                target: this.userName
            },
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
    }

    async delCinfirm(){
        const alert = await this.alertController.create({
          header: this.translate.instant("Confirm.Title"),
          message: this.translate.instant("Confirm.DeleteMessage"),
          buttons: [
            {
                text: this.translate.instant("Confirm.Cancel"),
                cssClass: 'secondary',
                handler: (blah) => {
                    
                }
            }, 
            {
                text: this.translate.instant("Comment.Delete"),
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
            this.localStorageService.clear("Reddah_GroupedContacts_Pub_"+this.userName);
            this.localStorageService.clear("Reddah_Contacts_Pub_"+this.userName);
            this.cacheService.clearGroup("PubPage");
        });
    }

    async unfocus(){
        const alert = await this.alertController.create({
            header: "",
            message: `${this.translate.instant("Pop.StillUnfocus")}${this.reddah.appData('usernickname_'+this.userName)} ${this.translate.instant("Pop.UnfocusMessage")}`,
            buttons: [
              {
                text: this.translate.instant("Pop.StillFocus"),
                role: 'cancel',
                cssClass: 'cssdark',
                handler: () => {}
              }, {
                text: this.translate.instant("Pop.StillUnfocus"),
                cssClass:'cssdanger',
                handler: () => {
                    this.actualUnfocus();
                }
              }
            ]
        });

        await alert.present().then(()=>{});
        
    }

    async actualUnfocus(){
        this.localStorageService.clear(`userisfriend_${this.userName}_${this.currentUserName}`);
        let formData = new FormData();
        formData.append("targetUser",this.userName);
        this.reddah.unFocus(formData).subscribe(_=>{
            this.localStorageService.clear("Reddah_GroupedContacts_Pub_"+this.userName);
            this.localStorageService.clear("Reddah_Contacts_Pub_"+this.userName);
            this.cacheService.clearGroup("PubPage");
        });
    }
  
    async viewer(photo) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
                index:0,
                imgSourceArray: this.reddah.preImageArray([photo]),
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
            },
            cssClass: "modal-fullscreen",
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
            },
            cssClass: "modal-fullscreen",
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
            },
            cssClass: "modal-fullscreen",
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
