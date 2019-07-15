import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, InfiniteScroll, Content } from '@ionic/angular';
import { SettingSignaturePage } from '../../../settings/setting-signature/setting-signature.page'
import { CacheService } from "ionic-cache";
import { ChangePhotoPage } from '../../../common/change-photo/change-photo.page';
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../../../reddah.service';
import { QrcardPage } from '../../../common/qrcard/qrcard.page';
import { SettingNickNamePage } from '../../../settings/setting-nickname/setting-nickname.page'
import { AddArticlePage } from '../add-article/add-article.page';
import { Article } from '../../../model/article';
import { PostviewerPage } from '../../../postviewer/postviewer.page';

@Component({
    selector: 'app-sub-info',
    templateUrl: './sub-info.page.html',
    styleUrls: ['./sub-info.page.scss'],
})
export class SubInfoPage implements OnInit {

    userName: string;
    @Input() targetUserName;
    
    articles = [];
    loadedIds = [];
    
    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    @ViewChild('pageTop') pageTop: Content;


    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.reddah.getUserPhotos(this.targetUserName);
    }

    showLoading=false;

    async ngOnInit() {
        this.showLoading = true;
        let cacheArticles = this.localStorageService.retrieve("reddah_articles_draft_"+this.targetUserName);
        let cacheArticleIds = this.localStorageService.retrieve("reddah_article_ids_draft_"+this.targetUserName);
        
        if(cacheArticles){
            this.articles = JSON.parse(cacheArticles);
            this.loadedIds = JSON.parse(cacheArticleIds);
            this.showLoading = false;
        }
        else
        {
            let locale = this.reddah.getCurrentLocale();
            let cacheKey = "this.reddah.getArticleDrafts" + JSON.stringify(this.loadedIds) + locale + this.targetUserName;
            let request = this.reddah.getArticles(this.loadedIds, locale, "draft", "", 0, this.targetUserName);

            this.cacheService.loadFromObservable(cacheKey, request, "SubInfoPage"+this.targetUserName)
            .subscribe(articles => 
            {
                for(let article of articles){
                    this.articles.push(article);
                    this.loadedIds.push(article.Id);
                }
                this.showLoading = false;
                this.localStorageService.store("reddah_articles_draft_"+this.targetUserName, JSON.stringify(this.articles));
                this.localStorageService.store("reddah_article_ids_draft_"+this.targetUserName, JSON.stringify(this.loadedIds));
            });
        }
    }

    getArticles(event):void {
        this.showLoading = true;
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        if(locale==null)
            locale = "en-US"

        let cacheKey = "this.reddah.getArticleDrafts" + JSON.stringify(this.loadedIds) + locale+this.targetUserName;
        let request = this.reddah.getArticles(this.loadedIds, locale, "draft", "", 0, this.targetUserName);

        this.cacheService.loadFromObservable(cacheKey, request, "SubInfoPage"+this.targetUserName)
        .subscribe(articles => 
        {
            for(let article of articles){
                this.articles.push(article);
                this.loadedIds.push(article.Id);  
            }
            this.showLoading = false;
            this.localStorageService.store("reddah_articles_draft_"+this.targetUserName, JSON.stringify(this.articles));
            this.localStorageService.store("reddah_article_ids_draft_"+this.targetUserName, JSON.stringify(this.loadedIds));
            if(event){
                event.target.complete();
            }
        });
    }   

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("SubInfoPage"+this.targetUserName);
        this.localStorageService.clear("reddah_articles_draft_"+this.targetUserName);
        this.localStorageService.clear("reddah_article_ids_draft_"+this.targetUserName);
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
              title: "更换Logo",
              tag : "portrait",
              targetUserName: this.targetUserName
          }
        });
          
        await userModal.present();
        const { data } = await userModal.onDidDismiss();
        if(data)
        {
            this.reddah.getUserPhotos(this.targetUserName);
        }
        this.changed = data;
    }

    async myQrCard(){
        const qrModal = await this.modalController.create({
            component: QrcardPage
        });
        
        await qrModal.present();
    }

    async changeNickName(){
        const modal = await this.modalController.create({
            component: SettingNickNamePage,
            componentProps: { 
                title: "设置名称",
                currentNickName: this.reddah.appData('usernickname_'+this.targetUserName),
                targetUserName: this.targetUserName
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data){
            this.reddah.getUserPhotos(this.targetUserName);
        }
        this.changed = data;
    }

    async changeSignature(){
        const modal = await this.modalController.create({
            component: SettingSignaturePage,
            componentProps: { 
                title: "设置描述",
                currentSignature: this.reddah.appData('usersignature_'+this.targetUserName),
                targetUserName: this.targetUserName
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data){
            this.reddah.getUserPhotos(this.targetUserName);
        }
        this.changed = data;
    }

    async add(){
        if(this.articles.length>=7){
            this.reddah.toast("普通用户最多可以保存7个草稿", "primary")
        }
        else{   
            const modal = await this.modalController.create({
                component: AddArticlePage,
                componentProps: { 
                    targetUserName: this.targetUserName
                }
            });
            await modal.present();
            const {data} = await modal.onDidDismiss();
            if(data){
                this.clearCacheAndReload(null)
            }
        }
    }

    async edit(article){
        const modal = await this.modalController.create({
            component: AddArticlePage,
            componentProps: { 
                targetUserName: this.targetUserName,
                article: article,
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data){
            this.clearCacheAndReload(null)
        }
    }
}
