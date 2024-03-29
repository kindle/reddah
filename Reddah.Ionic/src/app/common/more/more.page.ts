import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController, ActionSheetController, AlertController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { UserPage } from '../user/user.page';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { AddFeedbackPage } from 'src/app/mytimeline/add-feedback/add-feedback.page';
import { ArticleTextPopPage } from '../article-text-pop.page';
import { Article } from 'src/app/model/article';
import { PostviewerPage } from 'src/app/postviewer/postviewer.page';

@Component({
    selector: 'app-more',
    templateUrl: './more.page.html',
    styleUrls: ['./more.page.scss'],
})
export class MorePage implements OnInit {

    @Input() pub = false;

    @Input() target;

    userName;
    locale;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public authService: AuthService,
        private toastController: ToastController,
        private actionSheetController: ActionSheetController,
        private alertController: AlertController,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }

    userCommentArticles = [];
    ngOnInit() {
        let cachedArticles = this.localStorageService.retrieve("Reddah_morepage_"+this.target);
        let cachedArticleIds = this.localStorageService.retrieve("Reddah_morepage_ids_"+this.target);
        let cacheArticleArray = JSON.parse(cachedArticles);
        if(cachedArticles&&cacheArticleArray.length>0){
            let top = 20;
            this.userCommentArticles = JSON.parse(cachedArticles).slice(0,top);
            this.userCommentArticles.forEach(article=>{
                article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)
            });
            this.loadedIds = JSON.parse(cachedArticleIds).slice(0,top);
            //autofill
            //refer to home, todo
        }
        else{
            this.formData = new FormData();
            this.formData.append("loadedIds", JSON.stringify([]));
            this.formData.append("abstract", this.target);
    
            let cacheKey = "this.reddah.getMorePage"+this.target;
            let request = this.reddah.getUserComments(this.formData);
    
            this.cacheService.loadFromObservable(cacheKey, request, "MorePage")
            .subscribe(commentArticles => 
            {
                if(cachedArticles!=JSON.stringify(commentArticles))
                {
                    this.userCommentArticles = [];
                    this.loadedIds = [];
                    this.commentData = new Map();
    
                    for(let article of commentArticles){
    
                        article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)
    
                        this.userCommentArticles.push(article);
                        this.loadedIds.push(article.CommentId);
                        this.reddah.getUserPhotos(article.UserName);
                        //cache user image
                        this.reddah.toImageCache(article.UserPhoto, `userphoto_${article.UserName}`);
                        //cache preview image
                        article.Content.split('$$$').forEach((previewImageUrl)=>{
                            this.reddah.toFileCache(previewImageUrl);
                            //this.reddah.toImageCache(previewImageUrl, previewImageUrl);
                        });
                        this.GetCommentsData(article.Id);
                    }
    
                    this.localStorageService.store("Reddah_morepage_"+this.target, JSON.stringify(commentArticles));
                    this.localStorageService.store("Reddah_morepage_ids_"+this.target, JSON.stringify(this.loadedIds));
    
                }
                else{
                    for(let article of commentArticles){
                        this.GetCommentsData(article.Id);
                    }
                }
            });
        }

        
    }

    loadData(event) {
        this.getUserCommentArticles(event);
    }

    isMe(userName){
        return userName==this.reddah.getCurrentUser();
    }
    
    async fullText(text){
        const textModal = await this.modalController.create({
            component: ArticleTextPopPage,
            componentProps: { text: text },
            cssClass: "modal-fullscreen",
        });
          
        await textModal.present();
    }

    commentData = new Map();
    authoronly = false;
    async GetCommentsData(articleId: number){
        //console.log(`get ts comments:${articleId}`);
        let cacheKey = "this.reddah.getUserPageComments" + articleId;
        let request = this.reddah.getComments(articleId)

        this.cacheService.loadFromObservable(cacheKey, request, "MorePage")
        .subscribe(data => 
        {
            //console.log('load comments:'+articleId+JSON.stringify(data));
            this.commentData.set(articleId, data);
        });
    }

    async more_viewer(index, imageSrcArray) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
                index: index,
                imgSourceArray: this.reddah.preImageArray(imageSrcArray),
                imgTitle: "",
                imgDescription: "",
                showDownload: true,
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true
        });
    
        return await modal.present();
    }



    async more_report(article){
        const modal = await this.modalController.create({
            component: AddFeedbackPage,
            componentProps: { 
                title: this.reddah.instant("Pop.Report"),
                desc: this.reddah.instant("Pop.ReportReason"),
                feedbackType: 4,
                article: article
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    async delete(article){
        const alert = await this.alertController.create({
            header: this.reddah.instant("Confirm.Title"),
            message: this.reddah.instant("Confirm.DeleteMessage"),
            buttons: [
            {
                text: this.reddah.instant("Confirm.Cancel"),
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {}
            }, 
            {
                text: this.reddah.instant("Confirm.Yes"),
                handler: () => {
                    //serivce delete
                    
                    let formData = new FormData();
                    formData.append("Id",JSON.stringify(article.Id));
                    this.reddah.deleteArticle(formData).subscribe(data=>{
                        //console.log(JSON.stringify(data));
                    });

                    //UI delete
                    this.userCommentArticles.forEach((item, index)=>{
                        if(item.Id==article.Id){
                            this.userCommentArticles.splice(index, 1);
                        }
                    })
                    this.localStorageService.store("Reddah_morepage_"+this.target, this.userCommentArticles);
                    this.cacheService.clearGroup("MorePage");
                }
            }]
        });

        await alert.present().then(()=>{});
    }

    getUserCommentArticles(event):void {
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        this.formData.append("abstract", this.target);
        
        let cacheKey = "this.reddah.getMorePage" + this.target + this.loadedIds.join(',');
        let request = this.reddah.getUserComments(this.formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "MorePage")
        .subscribe(commentArticles => 
        {
            console.log(commentArticles)
            for(let article of commentArticles){
                article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)
                this.userCommentArticles.push(article);
                this.loadedIds.push(article.CommentId);
                this.reddah.getUserPhotos(article.UserName);
                //cache user image
                this.reddah.toImageCache(article.UserPhoto, `userphoto_${article.UserName}`);
                //cache preview image
                article.Content.split('$$$').forEach((previewImageUrl)=>{
                    this.reddah.toFileCache(previewImageUrl);
                });
                this.GetCommentsData(article.Id);
            }

            this.localStorageService.store("Reddah_morepage_"+this.target, JSON.stringify(commentArticles));
            this.localStorageService.store("Reddah_morepage_ids_"+this.target, JSON.stringify(this.loadedIds));

            if(event){
                event.target.complete();
            }

            //this.loading = false;
        });

    }

    clearCacheAndReload(){
        this.cacheService.clearGroup("MorePage");
        this.loadedIds = [-1];
        this.userCommentArticles = [];
        this.localStorageService.clear("Reddah_morepage_"+this.target);
        this.localStorageService.clear("Reddah_morepage_ids_"+this.target);
        this.getUserCommentArticles(event);
    }

    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload();
            event.target.complete();
        }, 2000);
    }

    loadedIds = [];
    formData: FormData;

    async view(article: Article){
        this.reddah.reloadLocaleSettings();
        const viewerModal = await this.modalController.create({
            component: PostviewerPage,
            componentProps: { article: article },
            cssClass: "modal-fullscreen",
        });
        
        await viewerModal.present();
        
        const { data } = await viewerModal.onDidDismiss();
        if(data||!data){   
            article.Read = true;
        }
    }
    
    async close() {
        await this.modalController.dismiss();
    }

    async goEmail() {
        
    }

    async goCert(){
        

    }

    async callService(){
        
    }

    getAdmins(){
        return this.reddah.appData('useradmins_'+this.target).split(',');
    }
    
    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
        });
            
        await userModal.present();
    }

}
