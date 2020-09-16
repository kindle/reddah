import { Component, OnInit, Input, Renderer2 } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ActionSheetController, NavParams, AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ApplyFriendPage } from '../../friend/apply-friend/apply-friend.page';
import { TimeLinePage } from '../../mytimeline/timeline/timeline.page';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { CacheService } from "ionic-cache";
import { SettingNoteLabelPage } from '../../settings/setting-note-label/setting-note-label.page';
import { ChatFirePage } from '../../chatfire/chat-fire.page';
import { MorePage } from '../more/more.page';
import { LocationPage } from '../location/location.page';
import { MiniViewerComponent } from '../mini-viewer/mini-viewer.component';
import { AddFeedbackPage } from '../../mytimeline/add-feedback/add-feedback.page';
import { ShareChooseChatPage } from '../../chat/share-choose-chat/share-choose-chat.page';
import { ArticleTextPopPage } from '../article-text-pop.page';
import { LocationHWPage } from '../locationhw/locationhw.page';

@Component({
    selector: 'app-user',
    templateUrl: 'user.page.html',
    styleUrls: ['user.page.scss']
})
export class UserPage implements OnInit {
    @Input() userName: string;

    currentUserName;
    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public actionSheetController: ActionSheetController,
        private alertController: AlertController,
    ){}

    isFriend = false;
    
    userPageArticles = [];
    ngOnInit(){
        this.currentUserName = this.reddah.getCurrentUser();
        this.reddah.getUserPhotos(this.userName);
        this.getTimeline();
        this.getUsedMini();
        this.isFriend = this.reddah.appData('userisfriend_'+this.userName+'_'+this.reddah.getCurrentUser())==1;

        let cachedArticles = this.localStorageService.retrieve("Reddah_userpage_"+this.userName);
        let cachedArticleIds = this.localStorageService.retrieve("Reddah_userpage_ids_"+this.userName);
        let cacheArticleArray = JSON.parse(cachedArticles);
        if(cachedArticles&&cacheArticleArray.length>0){
            let top = 20;
            this.userPageArticles = JSON.parse(cachedArticles).slice(0,top);
            this.userPageArticles.forEach(article=>{
                article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.currentUserName}_${article.Id}`)!=null)
            });
            this.loadedIds = JSON.parse(cachedArticleIds).slice(0,top);
            //autofill
            //refer to home, todo
        }
        else{
            this.formData = new FormData();
            this.formData.append("loadedIds", JSON.stringify([]));
            this.formData.append("abstract", this.userName);
    
            let cacheKey = "this.reddah.getUserPage"+this.userName;
            let request = this.reddah.getUserTopic(this.formData);
    
            this.cacheService.loadFromObservable(cacheKey, request, "UserPage")
            .subscribe(timeline => 
            {
                if(cachedArticles!=JSON.stringify(timeline))
                {
                    this.userPageArticles = [];
                    this.loadedIds = [];
                    this.commentData = new Map();
    
                    for(let article of timeline){
    
                        article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.currentUserName}_${article.Id}`)!=null)
    
                        this.userPageArticles.push(article);
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
    
                    this.localStorageService.store("Reddah_userpage_"+this.userName, JSON.stringify(timeline));
                    this.localStorageService.store("Reddah_userpage_ids_"+this.userName, JSON.stringify(this.loadedIds));
    
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
        this.getUserPageTopics(event);
    }

    isMe(userName){
        return userName==this.reddah.getCurrentUser();
    }
    
    async fullText(text){
        const textModal = await this.modalController.create({
            component: ArticleTextPopPage,
            componentProps: { text: text },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await textModal.present();
    }

    commentData = new Map();
    authoronly = false;
    async GetCommentsData(articleId: number){
        //console.log(`get ts comments:${articleId}`);
        let cacheKey = "this.reddah.getUserPageComments" + articleId;
        let request = this.reddah.getComments(articleId)

        this.cacheService.loadFromObservable(cacheKey, request, "UserPage")
        .subscribe(data => 
        {
            //console.log('load comments:'+articleId+JSON.stringify(data));
            this.commentData.set(articleId, data);
        });
    }

    async up_viewer(index, imageSrcArray) {
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
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
            keyboardClose: true,
            showBackdrop: true
        });
    
        return await modal.present();
    }


    async up_share(article){
        
        const actionSheet = await this.actionSheetController.create({
            header: '',
            buttons: [{
              text: this.reddah.instant("Common.Refresh"),
              icon: 'refresh',
              handler: () => {
                  this.clearCacheAndReload();
              }
            }, 
            
            ].concat(this.reddah.appData('userisfriend_'+this.userName+'_'+this.currentUserName)==1?
                [{
                    text: this.reddah.instant("Pop.Report"),
                    icon: 'alert',
                    handler: () => {
                        this.report();                  
                    }
                }]:[]
            ).concat(this.reddah.appData('userisfriend_'+this.userName+'_'+this.currentUserName)==1?
            [{
                text: this.reddah.instant("Comment.Delete"),
                icon: 'trash-outline',
                handler: () => {
                    this.delConfirm();                  
                }
            }]:[]
        )
        });
        await actionSheet.present();
        
    }

    async up_report(article){
        const modal = await this.modalController.create({
            component: AddFeedbackPage,
            componentProps: { 
                title: this.reddah.instant("Pop.Report"),
                desc: this.reddah.instant("Pop.ReportReason"),
                feedbackType: 4,
                article: article
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
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
                    this.userPageArticles.forEach((item, index)=>{
                        if(item.Id==article.Id){
                            this.userPageArticles.splice(index, 1);
                        }
                    })
                    this.localStorageService.store("Reddah_userpage_"+this.userName, this.userPageArticles);
                    this.cacheService.clearGroup("UserPage");
                }
            }]
        });

        await alert.present().then(()=>{});
    }

    getUserPageTopics(event):void {
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        this.formData.append("abstract", this.userName);
        
        let cacheKey = "this.reddah.getUserPage" + this.userName + this.loadedIds.join(',');
        let request = this.reddah.getUserTopic(this.formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "UserPage")
        .subscribe(timeline => 
        {
            console.log(timeline);
            for(let article of timeline){
                article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.currentUserName}_${article.Id}`)!=null)
                this.userPageArticles.push(article);
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

            this.localStorageService.store("Reddah_userpage_"+this.userName, JSON.stringify(timeline));
            this.localStorageService.store("Reddah_userpage_ids_"+this.userName, JSON.stringify(this.loadedIds));

            if(event){
                event.target.complete();
            }

            //this.loading = false;
        });

    }


    imageList = [];
    appList = [];
    loadedIds = [];
    formData: FormData;

    getTimeline(){
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getTimeline"+this.userName;
        //console.log(`cacheKey:${cacheKey}`);
        let request = this.reddah.getTimeline(this.formData);

        this.cacheService.loadFromObservable(cacheKey, request, "TimeLinePage"+this.userName)
        .subscribe(timeline => 
        {
            for(let article of timeline){
                
                article.Content.split('$$$').forEach((item)=>{
                    if(this.imageList.length<3&&item.length>0)  
                        this.imageList.push(item);
                });
                
                if(this.imageList.length>=3)
                    break;
            }
        });
    }

    getUsedMini(){
        this.formData = new FormData();
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getUsedMini"+this.userName;
        let request = this.reddah.getUsedMini(this.formData);

        this.cacheService.loadFromObservable(cacheKey, request, "UserPage"+this.userName)
        .subscribe(minis => 
        {
            for(let mini of minis){
                this.appList.push(mini);
                
                if(this.appList.length>=3)
                    break;
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

    async viewTimeline(){
        const timelineModal = await this.modalController.create({
            component: TimeLinePage,
            componentProps: { userName: this.userName },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await timelineModal.present();
    }

    async close(isCloseParent=false){
        await this.modalController.dismiss(isCloseParent);
    }

    clearCacheAndReload(event=null){
        this.cacheService.clearGroup("TimeLinePage"+this.userName);
        this.imageList = [];
        this.loadedIds = [];
        this.appList = [];
        this.cacheService.clearGroup("UserPage");
        this.loadedIds = [-1];
        this.userPageArticles = [];
        this.localStorageService.clear("Reddah_userpage_"+this.userName);
        this.localStorageService.clear("Reddah_userpage_ids_"+this.userName);
        this.getUserPageTopics(event);
        this.ngOnInit();
    }

    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload();
            if(event){
                event.target.complete();
            }
        }, 2000);
    }

    async presentActionSheet() {
        const actionSheet = await this.actionSheetController.create({
            //header: '',
            buttons: [{
              text: this.reddah.instant("Common.Refresh"),
              icon: 'refresh',
              handler: () => {
                  this.clearCacheAndReload();
              }
            }, 
            /*{
              text: 'Share',
              icon: 'share',
              handler: () => {
                  //console.log('Share clicked');
              }
            }*/
            ].concat(this.reddah.appData('userisfriend_'+this.userName+'_'+this.currentUserName)==1?
                [{
                    text: this.reddah.instant("Pop.Report"),
                    icon: 'warning-outline',
                    handler: () => {
                        this.report();                  
                    }
                }]:[]
            ).concat(this.reddah.appData('userisfriend_'+this.userName+'_'+this.currentUserName)==1?
            [{
                text: this.reddah.instant("Comment.Delete"),
                icon: 'trash-outline',
                handler: () => {
                    this.delConfirm();                  
                }
            }]:[]
        )
        });
        await actionSheet.present();
    }


    async report(){
        this.close();
        const modal = await this.modalController.create({
            component: AddFeedbackPage,
            componentProps: { 
                title: this.reddah.instant("Pop.Report"),
                desc: this.reddah.instant("Pop.ReportUserReason"),
                feedbackType: 6,
                article: null,
                userName: this.userName
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
    }

    async delConfirm(){
        const alert = await this.alertController.create({
          header: this.reddah.instant("Confirm.Title"),
          message: this.reddah.instant("Confirm.DeleteMessage"),
          buttons: [
            {
                text: this.reddah.instant("Confirm.Cancel"),
                cssClass: 'secondary',
                handler: (blah) => {
                    
                }
            }, 
            {
                text: this.reddah.instant("Comment.Delete"),
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

    async addFriend(){
        const applyFriendModal = await this.modalController.create({
            component: ApplyFriendPage,
            componentProps: { targetUserName: this.userName },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await applyFriendModal.present();
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
            showBackdrop: true,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
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
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data||!data)
            this.reddah.getUserPhotos(this.userName);
    }

    async chat(){
        const chatModal = await this.modalController.create({
            component: ChatFirePage,
            componentProps: { 
                title: this.reddah.appData('usernotename_'+this.userName+'_'+this.currentUserName),
                target: this.userName,
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        await chatModal.present();
        //const {data} = await modal.onDidDismiss();
    }

    async goMore(){
        const modal = await this.modalController.create({
            component: MorePage,
            componentProps: { target : this.userName},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await modal.present();
    }

    async goLocation(){
        if(this.userName!=this.reddah.getCurrentUser()){
            let location = this.reddah.appData('userlocationjson_'+this.userName);

            let isHwMapLoaded = (window["reddahMapHw"].loaded ===true);
          
            const modal = await this.modalController.create({
                component: isHwMapLoaded?LocationHWPage:LocationPage,
                componentProps: { location: JSON.parse(location) },
                cssClass: "modal-fullscreen",
                swipeToClose: true,
                presentingElement: await this.modalController.getTop(),
            });
        
            await modal.present();
        }
        else{
            this.changeLocation()
        }
        
    }

    async changeLocation(){
        const modal = await this.modalController.create({
            component: LocationPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
    
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.reddah.saveUserLocation(this.userName, data, data.location.lat, data.location.lng);
        }
    }

}
