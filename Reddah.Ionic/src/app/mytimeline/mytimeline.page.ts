import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { IonInfiniteScroll, IonContent, LoadingController, NavController, PopoverController, ModalController, AlertController, Platform, } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { TimelinePopPage } from '../common/timeline-pop.page';
import { UserPage } from '../common/user/user.page';
import { TimelineCommentPopPage } from '../common/timeline-comment-pop.page'
import { ImageViewerComponent } from '../common/image-viewer/image-viewer.component';
import { CacheService } from "ionic-cache";
import { ArticleTextPopPage } from '../common/article-text-pop.page'
import { ChangeCoverPopPage } from '../common/change-cover-pop.page'
import { AddTimelinePage } from '../mytimeline/add-timeline/add-timeline.page'
import { MessagePage } from '../mytimeline/message/message.page'
import { LocationPage } from '../common/location/location.page';

@Component({
    selector: 'app-mytimeline',
    templateUrl: 'mytimeline.page.html',
    styleUrls: ['mytimeline.page.scss']
})
export class MyTimeLinePage implements OnInit {

    userName: string;
    articles = [];
    loadedIds = [];
    formData: FormData;
    showAddComment = false;

    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    @ViewChild('newComment') newComment;
    @ViewChild('pageTop') pageTop: IonContent;
        
    loadData(event) {
        this.getMyTimeline(event);
    }

    goback(){
        this.navController.back();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        private renderer: Renderer2,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private popoverController: PopoverController,
        private cacheService: CacheService,
        private alertController: AlertController,
        private platform: Platform,
    ){
        this.reddah.reloadLocaleSettings();
        this.userName = this.reddah.getCurrentUser();
    }

    messages=[1];
    async goMessage(){
        const modal = await this.modalController.create({
            component: MessagePage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    isAndroid = false;
    ngOnInit(){
        if(this.platform.is('android')){
            this.isAndroid = true;
        }
        this.reddah.getUserPhotos(this.userName, true);

        let cachedArticles = this.localStorageService.retrieve("Reddah_mytimeline_"+this.userName);
        let cachedIds = this.localStorageService.retrieve("Reddah_mytimeline_ids_"+this.userName);
        if(cachedArticles){
            this.articles = JSON.parse(cachedArticles);
            this.loadedIds = JSON.parse(cachedIds);
        }

        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify([]));

        let cacheKey = "this.reddah.getMyTimeline";
        let request = this.reddah.getMyTimeline(this.formData);

        this.cacheService.loadFromObservable(cacheKey, request, "MyTimeLinePage")
        .subscribe(timeline => 
        {
            //console.log(timeline);
            if(cachedArticles!=JSON.stringify(timeline))
            {
                this.articles = [];
                this.loadedIds = [];
                this.commentData = new Map();

                for(let article of timeline){
                    this.articles.push(article);
                    this.loadedIds.push(article.Id);
                    
                    //cache user image
                    this.reddah.toImageCache(article.UserPhoto, `userphoto_${article.UserName}`);
                    //cache preview image
                    article.Content.split('$$$').forEach((previewImageUrl)=>{
                        this.reddah.toFileCache(previewImageUrl);
                        //this.reddah.toImageCache(previewImageUrl, previewImageUrl);
                    });
                    this.GetCommentsData(article.Id);
                }

                this.localStorageService.store("Reddah_mytimeline_"+this.userName,JSON.stringify(timeline));
                this.localStorageService.store("Reddah_mytimeline_ids_"+this.userName,JSON.stringify(this.loadedIds));

            }
            else{
                for(let article of timeline){
                    this.GetCommentsData(article.Id);
                }
            }
        });
    }

    getMyTimeline(event):void {
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        
        let cacheKey = "this.reddah.getMyTimeline" + this.loadedIds.join(',');
        let request = this.reddah.getMyTimeline(this.formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "MyTimeLinePage")
        .subscribe(timeline => 
        {
            for(let article of timeline){
                this.articles.push(article);
                this.loadedIds.push(article.Id);
                
                //cache user image
                this.reddah.toImageCache(article.UserPhoto, `userphoto_${article.UserName}`);
                //cache preview image
                article.Content.split('$$$').forEach((previewImageUrl)=>{
                    this.reddah.toFileCache(previewImageUrl);
                });
                this.GetCommentsData(article.Id);
            }

            this.localStorageService.store("Reddah_mytimeline_"+this.userName, JSON.stringify(timeline));
            this.localStorageService.store("Reddah_mytimeline_ids_"+this.userName, JSON.stringify(this.loadedIds));

            if(event){
                event.target.complete();
            }
        });

    }

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("MyTimeLinePage");
        this.loadedIds = [-1];
        this.articles = [];
        this.localStorageService.clear("Reddah_mytimeline_"+this.userName);
        this.localStorageService.clear("Reddah_mytimeline_ids_"+this.userName);
        this.getMyTimeline(event);
    }

    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
        this.timelineCoverImage.nativeElement.style.transform = "scale(1)";
    }

    doPull(event){
        //console.log(event.path);
        //console.log(event.path[3].offsetHeight);
        this.timelineCoverImage.nativeElement.style.transform = "scale(1.2)";
    }

    @ViewChild('headerStart')
    headerStart:ElementRef;
    @ViewChild('headerOnScroll')
    headerOnScroll:ElementRef;
    @ViewChild('timelineCover')
    timelineCover:ElementRef;
    @ViewChild('timelineCoverImage')
    timelineCoverImage:ElementRef;

    onScroll($event) {

        this.showAddComment = false;
        
        let offset = this.timelineCover.nativeElement.scrollHeight - $event.detail.scrollTop;
        
        if(offset>=250)
        {
            this.renderer.setStyle(this.headerStart.nativeElement, 'visibility', 'visible');
            this.renderer.setStyle(this.headerStart.nativeElement, 'opacity', '8');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
            
        }
        else if(offset<250 && offset>=150)
        {
            let opacity = (offset-150)/100;
            if(opacity<0) opacity=0;
            this.renderer.setStyle(this.headerStart.nativeElement, 'opacity', opacity + '');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
        }
        else if(offset<150 && offset>=-150){
            let opacity = (1-(offset-150)/100);
            if(opacity>1) opacity=1;
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'opacity', opacity + '');
        }
        else
        {
            this.renderer.setStyle(this.headerStart.nativeElement, 'visibility', 'hidden');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'visibility', 'visible');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'opacity', '8');
        }
    }

    async post(ev: any) {
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
            componentProps: { postType: postType },
            cssClass: "modal-fullscreen",
        });
          
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            this.doRefresh(null);
        }
    }

    async presentPopover(event: Event, id: any, groupNames: string) {
        let liked = this.reddah.getAllowedNames(groupNames).map(x=>x.displayName)
            .includes(this.reddah.getDisplayName(this.reddah.getCurrentUser()));
        //let liked = groupNames.split(',').includes(this.reddah.getDisplayName(this.reddah.getCurrentUser()));
        const popover = await this.popoverController.create({
            component: TimelineCommentPopPage,
            componentProps: { liked: liked },
            event: event,
            translucent: true,
            cssClass: 'common-comment-popover'
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data){
            if(data==1)
            {
                let likeAddFormData = new FormData();
                likeAddFormData.append("action", "add");
                likeAddFormData.append("id", id+"");
                this.reddah.like(likeAddFormData)
                .subscribe(data => 
                {
                    //console.log(JSON.stringify(data));
                    this.cacheService.clearGroup("MyTimeLinePage");
                });
                
                this.renderUiLike(id, "add");
                
            }

            if(data==2)
            {
                let likeRemoveFormData = new FormData();
                likeRemoveFormData.append("action", "remove");
                likeRemoveFormData.append("id", id+"");
                this.reddah.like(likeRemoveFormData)  
                .subscribe(data => 
                {
                    //console.log(JSON.stringify(data));
                    this.cacheService.clearGroup("MyTimeLinePage");
                });
                this.renderUiLike(id, "remove");
            }
            
            if(data==3){
                this.showAddComment = true;
                this.selectedArticleId = id;
                this.selectedCommentId = -1;
                this.selectedReplyPlaceholder = this.reddah.instant("Comment.Comment");
                setTimeout(() => {
                    this.newComment.setFocus();
                },150);
            }
        }
    }

    selectedArticleId: number;
    selectedCommentId: number;

    renderUiLike(id: number, action: string){
        this.articles.forEach((item, index, alias)=> {
            if(item.Id==id){
                let currentUser = this.reddah.getCurrentUser();
                if(action=="add"){
                    if(item.GroupName.length==0){
                        item.GroupName = currentUser;//this.reddah.getDisplayName(currentUser);
                    }
                    else {
                        item.GroupName += "," + currentUser;//this.reddah.getDisplayName(currentUser);
                    }
                }

                if(action=="remove"){
                    if(item.GroupName==currentUser){//this.reddah.getDisplayName(currentUser)){
                        item.GroupName="";
                    }
                    else {
                        let groupNames = item.GroupName.split(',');
                        groupNames.forEach((gitem, gindex, galias)=>{
                            if(gitem==currentUser){//this.reddah.getDisplayName(currentUser)){
                                groupNames.splice(gindex, 1);
                            }
                        });
                        item.GroupName = groupNames.join(',');
                    }
                }
                
                return false;
            }
        });
    }

    async viewer(index, imageSrcArray) {
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
  
    
    showFacePanel = false;
    toggleFacePanel(){
      this.showFacePanel= !this.showFacePanel;
    }
    faceSelection(face) {
        this.newComment.value += face;
    }


    commentData = new Map();
    authoronly = false;
    async GetCommentsData(articleId: number){
        //console.log(`get ts comments:${articleId}`);
        let cacheKey = "this.reddah.getTimelineComments" + articleId;
        let request = this.reddah.getComments(articleId)

        this.cacheService.loadFromObservable(cacheKey, request, "MyTimeLinePage")
        .subscribe(data => 
        {
            //console.log('load comments:'+articleId+JSON.stringify(data));
            this.commentData.set(articleId, data);
        });
    }

    SendComment(){
        this.showAddComment = false;
        
        let temp = this.commentData.get(this.selectedArticleId);
        temp.Comments.push({'Id': 0, 'ArticleId': this.selectedArticleId, 'ParentId': this.selectedCommentId, 
            'Content': this.newComment.value, 'UserName': this.reddah.getCurrentUser()});
        
        let uid = this.reddah.uuidv4();
        this.reddah.addComments(this.selectedArticleId, this.selectedCommentId, this.newComment.value, uid)
        .subscribe(data=>{
            let cacheKey = "this.reddah.getTimelineComments" + this.selectedArticleId;
            this.cacheService.removeItem(cacheKey);
            this.GetCommentsData(this.selectedArticleId);
        });
    }

    selectedReplyPlaceholder: string;
    showAddCommentFromChildren(event){
        this.selectedArticleId = event.articleId;
        this.selectedCommentId = event.commentId;
        this.showAddComment = true;
        this.selectedReplyPlaceholder = this.reddah.instant("Comment.Comment") + this.reddah.getDisplayName(event.userName) + ":";

        if(this.selectedArticleId!=event.articleId||this.selectedCommentId!=event.commentId)
        {
            this.newComment = "";
        }
        setTimeout(() => {
            this.newComment.setFocus();
        },150);
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

    async changeCover(){
        const popover = await this.popoverController.create({
            component: ChangeCoverPopPage,
            translucent: true,
            animated: true,
            cssClass: 'change-cover-popover',
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data==true)
        {
            this.reddah.getUserPhotos(this.userName, true);
        }
    }

    async goLocation(location){
        const modal = await this.modalController.create({
            component: LocationPage,
            componentProps: { location: JSON.parse(location) },
            cssClass: "modal-fullscreen",
        });
    
        await modal.present();
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
                    this.articles.forEach((item, index)=>{
                        if(item.Id==article.Id){
                            this.articles.splice(index, 1);
                        }
                    })
                    this.localStorageService.store("Reddah_mytimeline_"+this.userName,this.articles);
                    this.cacheService.clearGroup("MyTimeLinePage");
                }
            }]
        });

        await alert.present().then(()=>{});
    }
}
