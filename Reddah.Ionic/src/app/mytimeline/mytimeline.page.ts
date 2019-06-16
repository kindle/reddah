import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { TimelinePopPage } from '../common/timeline-pop.page';
import { UserPage } from '../common/user/user.page';
import { TimelineCommentPopPage } from '../common/timeline-comment-pop.page'
import { ImageViewerComponent } from '../common/image-viewer/image-viewer.component';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ArticleTextPopPage } from '../common/article-text-pop.page'
import { ChangeCoverPopPage } from '../common/change-cover-pop.page'
import { AddTimelinePage } from '../mytimeline/add-timeline/add-timeline.page'
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

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

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    @ViewChild('newComment') newComment;
    @ViewChild('pageTop') pageTop: Content;
        
    loadData(event) {
        this.getMyTimeline(event);
    }

    goback(){
        this.navController.goBack(true);
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        private renderer: Renderer,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private popoverController: PopoverController,
        private cacheService: CacheService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private transfer: FileTransfer, 
        private file: File,
        private statusBar: StatusBar,
    ){
        this.userName = this.reddah.getCurrentUser();
    }
    
    async ngOnInit(){
        this.reddah.getUserPhotos(this.userName, true);

        const loading = await this.loadingController.create({
            message: this.translateService.instant("Article.Loading"),
            spinner: 'circles',
        });
        await loading.present();
        
        this.loadedIds = [];
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));

        let cacheKey = "this.reddah.getMyTimeline";
        console.log(`cacheKey:${cacheKey}`);
        let request = this.reddah.getMyTimeline(this.formData);

        this.cacheService.loadFromObservable(cacheKey, request, "MyTimeLinePage")
        .subscribe(timeline => 
        {
            this.articles = [];
            this.loadedIds = [];
            this.commentData = new Map();

            for(let article of timeline){
                this.articles.push(article);
                this.loadedIds.push(article.Id);
                
                //cache user image
                this.reddah.CommonCache(article.UserPhoto, `userphoto_${article.UserName}`,"assets/icon/anonymous.png");
                //cache preview image
                article.Content.split('$$$').forEach((previewImageUrl)=>{
                    this.reddah.CommonCache(previewImageUrl, previewImageUrl,"assets/icon/noimage.jpg");
                });
                this.GetCommentsData(article.Id);
            }
            loading.dismiss();
        });
    }
  
    getMyTimeline(event):void {
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        
        let cacheKey = "this.reddah.getMyTimeline" + this.loadedIds.join(',');
        console.log(`loadmore_cacheKey:${cacheKey}`);
        let request = this.reddah.getMyTimeline(this.formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "MyTimeLinePage")
        .subscribe(timeline => 
        {
            for(let article of timeline){
                this.articles.push(article);
                this.loadedIds.push(article.Id);
                
                //cache user image
                this.reddah.CommonCache(article.UserPhoto, `userphoto_${article.UserName}`,"assets/icon/anonymous.png");
                //cache preview image
                article.Content.split('$$$').forEach((previewImageUrl)=>{
                    this.reddah.CommonCache(previewImageUrl, previewImageUrl,"assets/icon/noimage.jpg");
                });
            }
            if(event)
                event.target.complete();
        });

    }

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("MyTimeLinePage");
        this.loadedIds = [];
        this.articles = [];
        this.getMyTimeline(event);
    }

    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    @ViewChild('headerStart')
    headerStart:ElementRef;
    @ViewChild('headerOnScroll')
    headerOnScroll:ElementRef;
    @ViewChild('timelineCover')
    timelineCover:ElementRef;
    

    onScroll($event) {

        this.showAddComment = false;
        
        let offset = this.timelineCover.nativeElement.scrollHeight - $event.detail.scrollTop;
        
        if(offset>=250)
        {
            this.renderer.setElementStyle(this.headerStart.nativeElement, 'visibility', 'visible');
            this.renderer.setElementStyle(this.headerStart.nativeElement, 'opacity', '8');
            this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
            
        }
        else if(offset<250 && offset>=150)
        {
            let opacity = (offset-150)/100;
            if(opacity<0) opacity=0;
            this.renderer.setElementStyle(this.headerStart.nativeElement, 'opacity', opacity+'');
            this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
        }
        else if(offset<150 && offset>=-150){
            let opacity = (1-(offset-150)/100);
            if(opacity>1) opacity=1;
            this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'opacity', opacity+'');
        }
        else
        {
            this.renderer.setElementStyle(this.headerStart.nativeElement, 'visibility', 'hidden');
            this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'visibility', 'visible');
            this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'opacity', '8');
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
        if(data==1||data==2){
            alert(data)
            //data=1: take a photo, data=2: lib
            this.goPost(data);
        }
    }

    async goPost(postType){
        const postModal = await this.modalController.create({
            component: AddTimelinePage,
            componentProps: { postType: postType }
        });
          
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data||!data){
            alert(data)
            //this.clearCacheAndReload(null);
            this.doRefresh(null);
        }
    }

    async presentPopover(event: Event, id: any, groupNames: string) {
        let liked = groupNames.split(',').includes(this.reddah.getCurrentUser());
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
                        console.log(JSON.stringify(data));
                        this.cacheService.clearGroup("MyTimeLinePage");
                    }
                );
                
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
                        console.log(JSON.stringify(data));
                        this.cacheService.clearGroup("MyTimeLinePage");
                    }
                );
                this.renderUiLike(id, "remove");
            }
            
            if(data==3){
                this.showAddComment = true;
                this.selectedArticleId = id;
                this.selectedCommentId = -1;
                this.selectedReplyPlaceholder = "评论";
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
                        item.GroupName = currentUser;
                    }
                    else {
                        item.GroupName += "," + currentUser;
                    }
                }

                if(action=="remove"){
                    if(item.GroupName==currentUser){
                        item.GroupName="";
                    }
                    else {
                        let groupNames = item.GroupName.split(',');
                        groupNames.forEach((gitem, gindex, galias)=>{
                            if(gitem==currentUser){
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
                imgSourceArray: imageSrcArray,
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

    commentData = new Map();
    authoronly = false;
    async GetCommentsData(articleId: number){
        console.log(`get ts comments:${articleId}`);
        let cacheKey = "this.reddah.getTimelineComments" + articleId;
        let request = this.reddah.getComments(articleId)

        this.cacheService.loadFromObservable(cacheKey, request, "MyTimeLinePage")
            .subscribe(data => 
            {
                console.log('load comments:'+articleId+JSON.stringify(data));
                this.commentData.set(articleId, data);
            }
        );
    }

    SendComment(){
        this.showAddComment = false;
        
        let temp = this.commentData.get(this.selectedArticleId);
        temp.Comments.push({'Id': 0, 'ArticleId': this.selectedArticleId, 'ParentId': this.selectedCommentId, 
            'Content': this.newComment.value, 'UserName': this.reddah.getCurrentUser()});
        
        this.reddah.addComments(this.selectedArticleId, this.selectedCommentId, this.newComment.value)
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
        this.selectedReplyPlaceholder = "回复" + event.userName + ":";

        if(this.selectedArticleId!=event.articleId||this.selectedCommentId!=event.commentId)
        {
            this.newComment = "";
        }
        setTimeout(() => {
            this.newComment.setFocus();
        },150);
    }
    
    handleSelection(face) {
        this.newComment.value += face;
    }

    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            }
        });
          
        await userModal.present();
    }

    async fullText(text){
        const textModal = await this.modalController.create({
            component: ArticleTextPopPage,
            componentProps: { text: text }
        });
          
        await textModal.present();
    }

    async changeCover(){
        const popover = await this.popoverController.create({
            component: ChangeCoverPopPage,
            translucent: true,
            animated: false,
            cssClass: 'change-cover-popover',
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data)
            this.reddah.getUserPhotos(this.userName, true);
    }

}
