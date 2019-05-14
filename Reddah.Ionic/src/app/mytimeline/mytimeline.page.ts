import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { TimelinePopPage } from '../article-pop/timeline-pop.page';
import { UserPage } from '../user/user.page';
import { TimelineCommentPopPage } from '../article-pop/timeline-comment-pop.page'
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ArticleTextPopPage } from '../article-pop/article-text-pop.page'
import { ChangeCoverPopPage } from '../article-pop/change-cover-pop.page'
import { AddTimelinePage } from '../add-timeline/add-timeline.page'
import { CacheResult } from '../UserModel'
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';

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
        this.getMyTimeline();
        event.target.complete();
    }

    goback(){
        this.navController.goBack(true);
    }

    private fileTransfer: FileTransferObject; 

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
        ){
            this.userName = this.reddah.getCurrentUser();
    }

    appPhoto = { 
        cover: "assets/icon/timg.jpg", 
        userPhoto: "assets/icon/anonymous.png"
    };
    
    getUserInfo(){
        //check cache first
        let cachedCoverPath = this.localStorageService.retrieve(`${this.userName}_timeline_imageurl_cover`);
        if(cachedCoverPath!=null){
            this.appPhoto["cover"] = (<any>window).Ionic.WebView.convertFileSrc(cachedCoverPath);
            //bug when image not loaded, src width =0
            this.reddah.drawCanvasBackground(cachedCoverPath);
        }
        let cachedUserPhotoPath = this.localStorageService.retrieve(`${this.userName}_timeline_imageurl_userphoto`);
        if(cachedCoverPath!=null){
            this.appPhoto["userPhoto"] = (<any>window).Ionic.WebView.convertFileSrc(cachedUserPhotoPath);
        }

        //check from web
        this.formData = new FormData();
        this.formData.append("targetUser", this.userName);

        this.reddah.getUserInfo(this.formData)
            .subscribe(userInfo => 
            {
                if(userInfo.Cover!=null){
                    this.toCache(userInfo.Cover, `${this.userName}_timeline_imageurl_cover`, "cover");
                }
                if(userInfo.Photo!=null){
                    this.toCache(userInfo.Photo, `${this.userName}_timeline_imageurl_userphoto`,"userPhoto");
                }
            }
        );
    }

    toCache(webUrl, cacheKey, functionKey){
        webUrl = webUrl.replace("///","https://");
        let result = new CacheResult(false, '');
        let cachedImagePath = this.localStorageService.retrieve(cacheKey);
        //check if changed or not downloaded, go to download it
        let webImageName = webUrl.replace("https://login.reddah.com/uploadPhoto/","");
        let cacheImageName = "";
        if(cachedImagePath!=null){
            cacheImageName = cachedImagePath.replace(this.file.applicationStorageDirectory,"");
        }
        if(cachedImagePath==null||cacheImageName!=webImageName){
            this.fileTransfer = this.transfer.create();  
            let target = this.file.applicationStorageDirectory + webImageName;
            this.fileTransfer.download(webUrl, target).then((entry) => {
                this.localStorageService.store(cacheKey, target);
                this.appPhoto[functionKey] = (<any>window).Ionic.WebView.convertFileSrc(target);
            }, (error) => {
                console.log(JSON.stringify(error));
            });     

        }

        return result;
    }
    
    async ngOnInit(){
        this.getUserInfo();

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
                this.commentData = new Map();

                for(let article of timeline){
                    this.articles.push(article);
                    this.loadedIds.push(article.Id);
                    this.GetCommentsData(article.Id);
                }
                loading.dismiss();
            }
        );
    }
  
    getMyTimeline():void {
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
                }
            }
        );

    }

    clearCacheAndReload(){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("MyTimeLinePage");
        this.ngOnInit();
    }

    doRefresh(event) {
        console.log('Begin async operation');
    
        setTimeout(() => {
            this.clearCacheAndReload();
            event.target.complete();
        }, 2000);
    }

    ionViewDidLoad() {
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        console.log(locale);
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
            this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
            this.renderer.setElementStyle(this.headerStart.nativeElement, 'opacity', '8');
        }
        else if(offset<250 && offset>=150)
        {
            console.log('start change'+offset)
            let opacity = (offset-150)/100;
            if(opacity<0) opacity=0;
            this.renderer.setElementStyle(this.headerStart.nativeElement, 'opacity', opacity+'');
            this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
        }
        else if(offset<150 && offset>=0){
            let opacity = (1-(offset-150)/100);
            if(opacity>1) opacity=1;
            this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'opacity', opacity+'');
        }
        else
        {
            this.renderer.setElementStyle(this.headerStart.nativeElement, 'visibility', 'hidden');
            this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'visibility', 'visible');
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

        //data=1: take a photo, data=2: lib
        this.goPost(data);
        /*if(data!=null){
            this.router.navigate(['/post'], {
              queryParams: {
                postType: data
              }
            });
        }*/
    }

    async goPost(postType){
        const postModal = await this.modalController.create({
            component: AddTimelinePage,
            componentProps: { postType: postType }
        });
          
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            this.clearCacheAndReload();
        }
    }

    async presentPopover(event: Event, id: any, groupNames: string) {
        let liked = groupNames.split(',').includes(this.reddah.getCurrentUser());
        const popover = await this.popoverController.create({
            component: TimelineCommentPopPage,
            componentProps: { liked: liked },
            event: event,
            translucent: true,
            cssClass: 'like-comment-popover'
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
            componentProps: { userName: userName }
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
            this.getUserInfo();
    }

    GetCache(url){
        let org = this.localStorageService.retrieve(url);
        if(org){
            return (<any>window).Ionic.WebView.convertFileSrc(org);
        }
        return url;
    }

}
