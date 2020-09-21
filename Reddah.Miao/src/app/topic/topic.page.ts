import { Component, OnInit, ViewChild, Renderer2, ElementRef, Input } from '@angular/core';
import { IonInfiniteScroll, IonContent, IonRefresher, ActionSheetController, AlertController, Platform } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../model/article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { PostviewerPage } from '../postviewer/postviewer.page';
import { CacheService } from "ionic-cache";
import { MyInfoPage } from '../common/my-info/my-info.page';
import { SearchPage } from '../common/search/search.page';
import { UserPage } from '../common/user/user.page';
import { PubPage } from '../tabs/publisher/pub/pub.page';
import { AddTimelinePage } from 'src/app/mytimeline/add-timeline/add-timeline.page';
import { MessageListPage } from '../tabs/message/message.page';
import { ShareChooseChatPage } from '../chat/share-choose-chat/share-choose-chat.page';
import { TimelinePopPage } from '../common/timeline-pop.page';
import { LocationPage } from '../common/location/location.page';
import { ArticleTextPopPage } from '../common/article-text-pop.page';
import { ImageViewerComponent } from '../common/image-viewer/image-viewer.component';
import { TimelineCommentPopPage } from '../common/timeline-comment-pop.page';
import { MessagePage } from '../mytimeline/message/message.page';
import { AddFeedbackPage } from '../mytimeline/add-feedback/add-feedback.page';

@Component({
    selector: 'app-topic',
    templateUrl: 'topic.page.html',
    styleUrls: ['topic.page.scss']
})
export class TopicPage implements OnInit {

    @Input() mini;
    
    userName: string;
    articles = [];
    loadedIds = [];
    formData: FormData;
    showAddComment = false;
    loading = false;

    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    @ViewChild('newComment') newComment;
    @ViewChild('pageTop') pageTop: IonContent;
        
    loadData(event) {
        this.getMyTimeline(event);
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
            componentProps: {type:0},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
    }

    isAndroid = false;
    ngOnInit(){
        if(this.platform.is('android')){
            this.isAndroid = true;
        }
        this.reddah.getUserPhotos(this.mini.UserName, true);

        let cachedArticles = this.localStorageService.retrieve("Reddah_mytopic_"+this.mini.UserName);
        let cachedArticleIds = this.localStorageService.retrieve("Reddah_mytopic_ids_"+this.mini.UserName);
        let cacheArticleArray = JSON.parse(cachedArticles);
        if(cachedArticles&&cacheArticleArray.length>0){
            let top = 20;
            this.articles = JSON.parse(cachedArticles).slice(0,top);
            this.articles.forEach(article=>{
                article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)
            });
            this.loadedIds = JSON.parse(cachedArticleIds).slice(0,top);
            //autofill
            //refer to home, todo
        }
        else{
            this.formData = new FormData();
            this.formData.append("loadedIds", JSON.stringify([]));
            this.formData.append("abstract", this.mini.UserName);
    
            let cacheKey = "this.reddah.getMyTopic"+this.mini.UserName;
            let request = this.reddah.getMyTopic(this.formData);
    
            this.cacheService.loadFromObservable(cacheKey, request, "MyTopicPage")
            .subscribe(timeline => 
            {
                if(cachedArticles!=JSON.stringify(timeline))
                {
                    this.articles = [];
                    this.loadedIds = [];
                    this.commentData = new Map();
    
                    for(let article of timeline){
    
                        article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)
    
                        this.articles.push(article);
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
    
                    this.localStorageService.store("Reddah_mytopic_"+this.mini.UserName, JSON.stringify(timeline));
                    this.localStorageService.store("Reddah_mytopic_ids_"+this.mini.UserName, JSON.stringify(this.loadedIds));
    
                }
                else{
                    for(let article of timeline){
                        this.GetCommentsData(article.Id);
                    }
                }
            });
        }

        
    }

    getMyTimeline(event):void {
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        this.formData.append("abstract", this.mini.UserName);
        
        let cacheKey = "this.reddah.getMyTopic" + this.mini.UserName + this.loadedIds.join(',');
        let request = this.reddah.getMyTopic(this.formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "MyTopicPage")
        .subscribe(timeline => 
        {
            for(let article of timeline){
                article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)
                this.articles.push(article);
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

            this.localStorageService.store("Reddah_mytopic_"+this.mini.UserName, JSON.stringify(timeline));
            this.localStorageService.store("Reddah_mytopic_ids_"+this.mini.UserName, JSON.stringify(this.loadedIds));

            if(event){
                event.target.complete();
            }

            this.loading = false;
        });

    }

    clearCacheAndReload(event){
        //this.loading = true;
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("MyTopicPage");
        this.loadedIds = [-1];
        this.articles = [];
        this.localStorageService.clear("Reddah_mytopic_"+this.mini.UserName);
        this.localStorageService.clear("Reddah_mytopic_ids_"+this.mini.UserName);
        this.getMyTimeline(event);
    }

    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
        //this.timelineCover.nativeElement.style.transform = "scale(1)";
    }

    doPull(event){
        //this.timelineCover.nativeElement.style.transform = "scale(1.2)";
    }

    @ViewChild('headerStart')
    headerStart:ElementRef;
    @ViewChild('headerOnScroll')
    headerOnScroll:ElementRef;
    @ViewChild('timelineCover')
    timelineCover:ElementRef;
    
    async onScroll($event){
        let offset = this.timelineCover.nativeElement.scrollHeight - $event.detail.scrollTop;
        
        if(offset>=250)
        {
            this.renderer.setStyle(this.headerStart.nativeElement, 'visibility', 'visible');
            this.renderer.setStyle(this.headerStart.nativeElement, 'opacity', '8');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
        }
        else if(offset<250 && offset>=180)
        {
            let opacity = (offset-180)/100;
            if(opacity<0) opacity=0;
            this.renderer.setStyle(this.headerStart.nativeElement, 'opacity', opacity + '');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
        }
        else{
            this.renderer.setStyle(this.headerStart.nativeElement, 'visibility', 'hidden');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'visibility', 'visible');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'opacity', '8');
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
                    this.cacheService.clearGroup("MyTopicPage");
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
                    this.cacheService.clearGroup("MyTopicPage");
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
            showBackdrop: true,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
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
        let cacheKey = "this.reddah.getTopicComments" + articleId;
        let request = this.reddah.getComments(articleId)

        this.cacheService.loadFromObservable(cacheKey, request, "MyTopicPage")
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
            let cacheKey = "this.reddah.getTopicComments" + this.selectedArticleId;
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
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await userModal.present();
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

    async goLocation(location){
        const modal = await this.modalController.create({
            component: LocationPage,
            componentProps: { location: JSON.parse(location) },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
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
                    this.localStorageService.store("Reddah_mytopic_"+this.mini.UserName,this.articles);
                    this.cacheService.clearGroup("MyTopicPage");
                }
            }]
        });

        await alert.present().then(()=>{});
    }

    close() {
        this.modalController.dismiss();
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
            componentProps: { 
                postType: postType,
                action: 'topic',
                mini:this.mini
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            this.doRefresh(null);
        }
    }

    async share(){
        const modal = await this.modalController.create({
            component: ShareChooseChatPage,
            componentProps: { 
                title: this.reddah.instant("Common.Choose"),
                article: this.mini,
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present(); 
    }

    async report(article){
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
}
