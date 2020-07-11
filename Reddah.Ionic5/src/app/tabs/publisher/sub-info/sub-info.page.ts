import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, IonInfiniteScroll, IonContent, Platform } from '@ionic/angular';
import { SettingSignaturePage } from '../../../settings/setting-signature/setting-signature.page'
import { CacheService } from "ionic-cache";
import { ChangePhotoPage } from '../../../common/change-photo/change-photo.page';
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../../../reddah.service';
import { QrcardPage } from '../../../common/qrcard/qrcard.page';
import { SettingNickNamePage } from '../../../settings/setting-nickname/setting-nickname.page'
import { AddArticlePage } from '../add-article/add-article.page';
import { AddMiniPage } from '../add-mini/add-mini.page';
import { MiniViewerComponent } from '../../../common/mini-viewer/mini-viewer.component';
import { MaterialPage } from '../../../mytimeline/material/material.page';
import { ShareChooseChatPage } from '../../../chat/share-choose-chat/share-choose-chat.page';
import { AddFeedbackPage } from '../../../mytimeline/add-feedback/add-feedback.page';

@Component({
    selector: 'app-sub-info',
    templateUrl: './sub-info.page.html',
    styleUrls: ['./sub-info.page.scss'],
})
export class SubInfoPage implements OnInit {

    userName: string;
    @Input() targetSub;
    
    articles = [];
    loadedIds = [];
    
    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    @ViewChild('pageTop') pageTop: IonContent;


    isCordova = false;
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        private platform: Platform,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.isCordova = this.platform.is('cordova')
    }

    showLoading=false;

    ngOnInit() {
        this.reddah.getUserPhotos(this.targetSub.UserName);
        
        this.showLoading = true;
        let cacheArticles = this.localStorageService.retrieve("reddah_articles_draft_"+this.targetSub.UserName);
        let cacheArticleIds = this.localStorageService.retrieve("reddah_article_ids_draft_"+this.targetSub.UserName);
        
        if(cacheArticles){
            this.articles = JSON.parse(cacheArticles);
            this.loadedIds = JSON.parse(cacheArticleIds);
            this.showLoading = false;
        }
        else
        {
            let locale = this.reddah.getCurrentLocale();
            let cacheKey = "this.reddah.getArticleDrafts" + JSON.stringify(this.loadedIds) + locale + this.targetSub.UserName;
            let request = this.reddah.getArticles(this.loadedIds,[],[], locale, "draft", "", 0, this.targetSub.UserName);

            this.cacheService.loadFromObservable(cacheKey, request, "SubInfoPage"+this.targetSub.UserName)
            .subscribe(articles => 
            {
                for(let article of articles){
                    this.articles.push(article);
                    this.loadedIds.push(article.Id);
                }
                this.showLoading = false;
                this.localStorageService.store("reddah_articles_draft_"+this.targetSub.UserName, JSON.stringify(this.articles));
                this.localStorageService.store("reddah_article_ids_draft_"+this.targetSub.UserName, JSON.stringify(this.loadedIds));
            });
        }
    }

    getArticles(event):void {
        this.showLoading = true;
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        if(locale==null)
            locale = "en-US"

        let cacheKey = "this.reddah.getArticleDrafts" + JSON.stringify(this.loadedIds) + locale+this.targetSub.UserName;
        let request = this.reddah.getArticles(this.loadedIds,[],[], locale, "draft", "", 0, this.targetSub.UserName);

        this.cacheService.loadFromObservable(cacheKey, request, "SubInfoPage"+this.targetSub.UserName)
        .subscribe(articles => 
        {
            for(let article of articles){
                this.articles.push(article);
                this.loadedIds.push(article.Id);  
            }
            this.showLoading = false;
            this.localStorageService.store("reddah_articles_draft_"+this.targetSub.UserName, JSON.stringify(this.articles));
            this.localStorageService.store("reddah_article_ids_draft_"+this.targetSub.UserName, JSON.stringify(this.loadedIds));
            if(event){
                event.target.complete();
            }
        });
    }   

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("SubInfoPage"+this.targetSub.UserName);
        this.localStorageService.clear("reddah_articles_draft_"+this.targetSub.UserName);
        this.localStorageService.clear("reddah_article_ids_draft_"+this.targetSub.UserName);
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

    async close() {
        await this.modalController.dismiss(this.changed);
    }

    changed : false;
    async changePhoto(){
        const userModal = await this.modalController.create({
          component: ChangePhotoPage,
          componentProps: { 
              title: this.reddah.instant("About.Photo"),
              tag : "portrait",
              targetUserName: this.targetSub.UserName
          },
          cssClass: "modal-fullscreen",
        });
          
        await userModal.present();
        const { data } = await userModal.onDidDismiss();
        if(data)
        {
            this.reddah.getUserPhotos(this.targetSub.UserName);
        }
        this.changed = data;
    }

    async SelectPhoto(){
        const modal = await this.modalController.create({
            component: MaterialPage,
            componentProps: { 
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    async myQrCard(){
        const qrModal = await this.modalController.create({
            component: QrcardPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await qrModal.present();
    }

    async changeNickName(){
        const modal = await this.modalController.create({
            component: SettingNickNamePage,
            componentProps: { 
                title: this.reddah.instant("Input.Name"),
                currentNickName: this.reddah.appData('usernickname_'+this.targetSub.UserName),
                targetUserName: this.targetSub.UserName
            },
            cssClass: "modal-fullscreen",
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data){
            this.reddah.getUserPhotos(this.targetSub.UserName);
        }
        this.changed = data;
    }

    async changeSignature(){
        const modal = await this.modalController.create({
            component: SettingSignaturePage,
            componentProps: { 
                title: this.reddah.instant("Input.Description"),
                currentSignature: this.reddah.appData('usersignature_'+this.targetSub.UserName),
                targetUserName: this.targetSub.UserName
            },
            cssClass: "modal-fullscreen",
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data){
            this.reddah.getUserPhotos(this.targetSub.UserName);
        }
        this.changed = data;
    }

    async addArticle(){
        if(this.articles.length>=3){
            this.reddah.toast(this.reddah.instant("Common.MaxDraft"), "primary")
        }
        else{   
            const modal = await this.modalController.create({
                component: AddArticlePage,
                componentProps: { 
                    targetUserName: this.targetSub.UserName
                },
                cssClass: "modal-fullscreen",
            });
            await modal.present();
            const {data} = await modal.onDidDismiss();
            if(data){
                this.clearCacheAndReload(null)
            }
        }
    }

    async editArticle(article){
        const modal = await this.modalController.create({
            component: AddArticlePage,
            componentProps: { 
                targetUserName: this.targetSub.UserName,
                article: article,
            },
            cssClass: "modal-fullscreen",
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data){
            this.clearCacheAndReload(null)
        }
    }

    async addMini(){
        if(this.articles.length>=1){
            this.reddah.toast(this.reddah.instant("Common.WorkingCopyExist"), "primary")
        }
        else{   
            const modal = await this.modalController.create({
                component: AddMiniPage,
                componentProps: { 
                    targetUserName: this.targetSub.UserName,

                },
                cssClass: "modal-fullscreen",
                swipeToClose: true,
                presentingElement: await this.modalController.getTop(),
            });
            await modal.present();
            const {data} = await modal.onDidDismiss();
            if(data){
                this.clearCacheAndReload(null)
            }
        }
    }

    async editMini(article){
        const modal = await this.modalController.create({
            component: AddMiniPage,
            componentProps: { 
                targetUserName: this.targetSub.UserName,
                article: article,
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data){
            this.clearCacheAndReload(null)
        }
    }

    async goMini(mini){
        
        //open mini page
        const modal = await this.modalController.create({
            component: MiniViewerComponent,
            componentProps: { 
                mini: mini,
                content: mini.Cover,
                guid: mini.UserName,
                //version: mini.Sex,//always use the latest version
                version: this.reddah.appData('usersex_'+mini.UserName)
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
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
                    swipeToClose: true,
                    presentingElement: await this.modalController.getTop(),
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
                    swipeToClose: true,
                    presentingElement: await this.modalController.getTop(),
                });
                  
                await modal.present();        
            }
        }

        this.reddah.setRecent(mini,4);
        this.reddah.setRecentUseMini(mini.UserName).subscribe(data=>{});
    }
}
