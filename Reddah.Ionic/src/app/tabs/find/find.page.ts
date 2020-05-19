import { Component, ViewChild, OnInit } from '@angular/core';
import { ModalController, AlertController, ActionSheetController, PopoverController } from '@ionic/angular'
import { ScanPage } from '../../common/scan/scan.page';
import { SearchPage } from '../../common/search/search.page';
import { ShakePage } from '../../shake/shake.page';
import { ReddahService } from '../../reddah.service';
import { LocationPage } from '../../common/location/location.page';
import { MagicMirrorPage } from '../../common/magic-mirror/magic-mirror.page';
import { WormHolePage } from '../../common/worm-hole/worm-hole.page';
import {  Router } from '@angular/router';
import { MysticPage } from '../../common/mystic/mystic.page';
import { StoryPage } from '../../story/story.page';
import { MapPage } from '../../map/map.page';
import { PlatformPage } from '../publisher/platform/platform.page';
import { ShareChooseChatPage } from '../../chat/share-choose-chat/share-choose-chat.page';
import { AddFeedbackPage } from '../../mytimeline/add-feedback/add-feedback.page';
import { MiniViewerComponent } from '../../common/mini-viewer/mini-viewer.component';
import { LocalStorageService } from 'ngx-webstorage';
import { CacheService } from 'ionic-cache';
import { ArticleTextPopPage } from 'src/app/common/article-text-pop.page';
import { ImageViewerComponent } from 'src/app/common/image-viewer/image-viewer.component';
import { UserPage } from 'src/app/common/user/user.page';
import { AddTimelinePage } from 'src/app/mytimeline/add-timeline/add-timeline.page';
import { TimelinePopPage } from 'src/app/common/timeline-pop.page';
import { ActiveUsersPage } from 'src/app/activeusers/activeusers.page';

@Component({
  selector: 'app-find',
  templateUrl: 'find.page.html',
  styleUrls: ['find.page.scss']
})
export class FindPage implements OnInit  {

    userName;
    user_apps=[];

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private router: Router,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        private alertController: AlertController,
        private actionSheetController: ActionSheetController,
        private popoverController: PopoverController,
    ){
        this.user_apps = this.reddah.loadRecent(4);
        this.loadSuggestMini();
    }


    loadedIds = [];
    formData: FormData;
    findPageArticles = [];
    ngOnInit(){
        this.userName = this.reddah.getCurrentUser();
        
        let cachedArticles = this.localStorageService.retrieve("Reddah_findpage_"+this.userName);
        let cachedArticleIds = this.localStorageService.retrieve("Reddah_findpage_ids_"+this.userName);
        let cacheArticleArray = JSON.parse(cachedArticles);
        if(cachedArticles&&cacheArticleArray.length>0){
            let top = 20;
            this.findPageArticles = JSON.parse(cachedArticles).slice(0,top);
            this.findPageArticles.forEach(article=>{
                article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)
            });
            this.loadedIds = JSON.parse(cachedArticleIds).slice(0,top);
            //autofill
            //refer to home, todo
        }
        else{
            this.formData = new FormData();
            this.formData.append("loadedIds", JSON.stringify([]));
            this.formData.append("abstract", this.userName);
    
            let cacheKey = "this.reddah.getFindPage"+this.userName;
            let request = this.reddah.getFindPageTopic(this.formData);
    
            this.cacheService.loadFromObservable(cacheKey, request, "FindPage")
            .subscribe(timeline => 
            {
                if(cachedArticles!=JSON.stringify(timeline))
                {
                    this.findPageArticles = [];
                    this.loadedIds = [];
                    this.commentData = new Map();
    
                    for(let article of timeline){
    
                        article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)
    
                        this.findPageArticles.push(article);
                        this.loadedIds.push(article.Id);
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
    
                    this.localStorageService.store("Reddah_findpage_"+this.userName, JSON.stringify(timeline));
                    this.localStorageService.store("Reddah_findpage_ids_"+this.userName, JSON.stringify(this.loadedIds));
    
                }
                else{
                    for(let article of timeline){
                        this.GetCommentsData(article.Id);
                    }
                }
            });
        }

        
    }

    loadData(event) {
        this.getFindPageTopics(event);
    }

    isMe(userName){
        return userName==this.reddah.getCurrentUser();
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
                    this.findPageArticles.forEach((item, index)=>{
                        if(item.Id==article.Id){
                            this.findPageArticles.splice(index, 1);
                        }
                    })
                    this.localStorageService.store("Reddah_findpage_"+this.userName,this.findPageArticles);
                    this.cacheService.clearGroup("FindPage");
                }
            }]
        });

        await alert.present().then(()=>{});
    }

    async goMiniById(abstract){
       let key = this.reddah.getDisplayName(abstract, 100);
        const modal = await this.modalController.create({
            component: SearchPage,
            componentProps: { 
                key: key,
                type: 3,//array index not id
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
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
        let cacheKey = "this.reddah.getFindPageComments" + articleId;
        let request = this.reddah.getComments(articleId)

        this.cacheService.loadFromObservable(cacheKey, request, "FindPage")
        .subscribe(data => 
        {
            //console.log('load comments:'+articleId+JSON.stringify(data));
            this.commentData.set(articleId, data);
        });
    }

    async fd_viewer(index, imageSrcArray) {
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

    async fd_report(article){
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

    getFindPageTopics(event):void {
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        this.formData.append("abstract", this.userName);
        
        let cacheKey = "this.reddah.getFindPage" + this.userName + this.loadedIds.join(',');
        let request = this.reddah.getFindPageTopic(this.formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "FindPage")
        .subscribe(timeline => 
        {
            console.log(timeline);
            for(let article of timeline){
                article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)
                this.findPageArticles.push(article);
                this.loadedIds.push(article.Id);
                this.reddah.getUserPhotos(article.UserName);
                //cache user image
                this.reddah.toImageCache(article.UserPhoto, `userphoto_${article.UserName}`);
                //cache preview image
                article.Content.split('$$$').forEach((previewImageUrl)=>{
                    this.reddah.toFileCache(previewImageUrl);
                });
                this.GetCommentsData(article.Id);
            }

            this.localStorageService.store("Reddah_findpage_"+this.userName, JSON.stringify(timeline));
            this.localStorageService.store("Reddah_findpage_ids_"+this.userName, JSON.stringify(this.loadedIds));

            if(event){
                event.target.complete();
            }

            //this.loading = false;
        });

    }

    clearCacheAndReload(){
        this.loadedIds = [];
        this.cacheService.clearGroup("FindPage");
        this.loadedIds = [-1];
        this.findPageArticles = [];
        this.localStorageService.clear("Reddah_findpage_"+this.userName);
        this.localStorageService.clear("Reddah_findpage_ids_"+this.userName);
        this.getFindPageTopics(event);
    }

    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload();
            event.target.complete();
        }, 2000);
    }

    loadSuggestMini(){
        let recentList = this.reddah.loadRecent(4).map(x=>x.UserName);
        let cacheKey = "this.reddah.getSuggestMinis";
        //let request = this.reddah.getSuggestMinis();

        //this.cacheService.loadFromObservable(cacheKey, request, "SearchPage")

        recentList.forEach((item, index, alias)=>{
            this.reddah.getUserPhotos(item.UserName);
        });

        this.reddah.getSuggestMinis()
        .subscribe(data=>{
            
            data.forEach((item, index, alias)=>{
                if(recentList.indexOf(item.UserName)>-1){
                    item.isRecent = true;
                }
                this.reddah.getUserPhotos(item.UserName);
            });

            this.user_apps = this.user_apps.concat(data.filter(x=>!x.isRecent));

        })
    }

    async startScanner(){
        const scanModal = await this.modalController.create({
            component: ScanPage,
            componentProps: { },
            cssClass: "modal-fullscreen",
        });
        
        await scanModal.present();
        const { data } = await scanModal.onDidDismiss();
        if(data){
            //console.log(data)
        }

    };

    async goSearch(){
        const userModal = await this.modalController.create({
            component: SearchPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
          
        await userModal.present();
    }

    async shake(){
        let myLocationstr = this.reddah.appData("userlocationjson_"+this.userName);
        let myLocation = null;
        try{
            myLocation = JSON.parse(myLocationstr);
        }catch(e){}
        if(myLocation&&myLocation.location){
            const modal = await this.modalController.create({
                component: ShakePage,
                componentProps: {},
                cssClass: "modal-fullscreen",
            });
              
            await modal.present();
        }
        else{
            this.changeLocation();
        }
    }

    async changeLocation(){
        const modal = await this.modalController.create({
            component: LocationPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
    
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.reddah.saveUserLocation(this.userName, data, data.location.lat, data.location.lng);
        }
    }


    async magicMirror(){
        const modal = await this.modalController.create({
            component: MagicMirrorPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }

    async magicMirrorCat(){
        const modal = await this.modalController.create({
            component: MagicMirrorPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }

    async blackHole(){
        const modal = await this.modalController.create({
            component: WormHolePage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }

    async mystic(){
        const modal = await this.modalController.create({
            component: MysticPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }

    async newUsers(){
        const modal = await this.modalController.create({
            component: ActiveUsersPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }

    async story(){
        const modal = await this.modalController.create({
            component: StoryPage,
            componentProps: {
                //lat: this.config.lat,
                //lng: this.config.lng
            },
            cssClass: "modal-fullscreen",
        });
            
        await modal.present();
    }

    async map(){
        const modal = await this.modalController.create({
            component: MapPage,
            componentProps: {
                //lat: this.config.lat,
                //lng: this.config.lng
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    async goPlatform(){
        const modal = await this.modalController.create({
            component: PlatformPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
    }

    @ViewChild('earthbox') earthbox;
    showBox= false;
    async showEarthBox(){
        //this.showBox = !this.showBox;
    }

    goMoreApp(){
        this.router.navigate(['/search'], {
            queryParams: {
                type:3
            }
        });
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
        this.reddah.setRecentUseMini(mini.UserName).subscribe(data=>{
            this.user_apps = this.reddah.loadRecent(4);
        });
    }

    async create() {
        const popover = await this.popoverController.create({
            component: TimelinePopPage,
            animated: false,
            translucent: true,
            cssClass: 'post-option-popover'
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data==1||data==2||data==3){
            //data=1: take a photo, data=2: lib photo, data=3: lib video
            this.goPost(data);
        }
    }

    async goPost(postType){
        const postModal = await this.modalController.create({
            component: AddTimelinePage,
            componentProps: { 
                postType: postType,
                action: 'topic',
            },
            cssClass: "modal-fullscreen",
        });
          
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            this.doRefresh(null);
        }
    }
}
