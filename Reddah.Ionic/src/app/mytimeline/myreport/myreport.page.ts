import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { InfiniteScroll, Content, LoadingController, NavController, PopoverController, ModalController, AlertController, } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { TranslateService } from '@ngx-translate/core';
import { UserPage } from '../../common/user/user.page';
import { ReportCommentPopPage } from '../../common/report-comment-pop.page'
import { ImageViewerComponent } from '../../common/image-viewer/image-viewer.component';
import { CacheService } from "ionic-cache";
import { ArticleTextPopPage } from '../../common/article-text-pop.page'

@Component({
    selector: 'app-myreport',
    templateUrl: 'myreport.page.html',
    styleUrls: ['myreport.page.scss']
})
export class MyReportPage implements OnInit {
    userName: string;
    articles = [];
    loadedIds = [];
    formData: FormData;
    showAddComment = false;

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    @ViewChild('newComment') newComment;
    @ViewChild('pageTop') pageTop: Content;
        
    loadData(event) {
        this.getMyReport(event);
    }

    goback(){
        this.modalController.dismiss();
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
        private alertController: AlertController,
        private translate: TranslateService,
    ){
        this.userName = this.reddah.getCurrentUser();
    }
    
    async ngOnInit(){
        this.reddah.getUserPhotos(this.userName, true);

        let cachedArticles = this.localStorageService.retrieve("Reddah_myreport");
        let cachedIds = this.localStorageService.retrieve("Reddah_myreport_ids");
        if(cachedArticles){
            this.articles = JSON.parse(cachedArticles);
            this.loadedIds = JSON.parse(cachedIds);
        }

        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify([]));

        let cacheKey = "this.reddah.getMyReport";
        let request = this.reddah.getMyReport(this.formData);

        this.cacheService.loadFromObservable(cacheKey, request, "MyReportPage")
        .subscribe(myreport => 
        {
            if(cachedArticles!=JSON.stringify(myreport))
            {
                this.articles = [];
                this.loadedIds = [];
                this.commentData = new Map();

                for(let article of myreport){
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

                this.localStorageService.store("Reddah_myreport",JSON.stringify(myreport));
                this.localStorageService.store("Reddah_myreport_ids",JSON.stringify(this.loadedIds));

            }
            else{
                for(let article of myreport){
                    this.GetCommentsData(article.Id);
                }
            }
        });
    }

    getMyReport(event):void {
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        
        let cacheKey = "this.reddah.getMyReport" + this.loadedIds.join(',');
        let request = this.reddah.getMyReport(this.formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "MyReportPage")
        .subscribe(myreport => 
        {
            for(let article of myreport){
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

            this.localStorageService.store("Reddah_myreport", JSON.stringify(myreport));
            this.localStorageService.store("Reddah_myreport_ids", JSON.stringify(this.loadedIds));

            if(event){
                event.target.complete();
            }
        });

    }

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("MyReportPage");
        this.loadedIds = [-1];
        this.articles = [];
        this.localStorageService.clear("Reddah_myreport");
        this.localStorageService.clear("Reddah_myreport_ids");
        this.getMyReport(event);
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

    async presentPopover(event: Event, id: any, groupNames: string) {
        let liked = this.reddah.getAllowedNames(groupNames).map(x=>x.displayName)
            .includes(this.reddah.getDisplayName(this.reddah.getCurrentUser()));
        //let liked = groupNames.split(',').includes(this.reddah.getDisplayName(this.reddah.getCurrentUser()));
        const popover = await this.popoverController.create({
            component: ReportCommentPopPage,
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
                //set status=-1
                //set read, give award point
                //delete in UI

                /*let likeAddFormData = new FormData();
                likeAddFormData.append("action", "add");
                likeAddFormData.append("id", id+"");
                this.reddah.like(likeAddFormData)
                .subscribe(data => 
                {
                    //console.log(JSON.stringify(data));
                    this.cacheService.clearGroup("ReportPage");
                });
                
                this.renderUiLike(id, "add");*/
                
            }

            if(data==2)
            {
                //set read, no award points
                //delete in UI

                /*let likeRemoveFormData = new FormData();
                likeRemoveFormData.append("action", "remove");
                likeRemoveFormData.append("id", id+"");
                this.reddah.like(likeRemoveFormData)  
                .subscribe(data => 
                {
                    //console.log(JSON.stringify(data));
                    this.cacheService.clearGroup("ReportPage");
                });
                this.renderUiLike(id, "remove");*/
            }
            
            if(data==3){
                this.showAddComment = true;
                this.selectedArticleId = id;
                this.selectedCommentId = -1;
                this.selectedReplyPlaceholder = this.translate.instant("Comment.Comment");
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
        let cacheKey = "this.reddah.getMyReportComments" + articleId;
        let request = this.reddah.getComments(articleId)

        this.cacheService.loadFromObservable(cacheKey, request, "MyReportPage")
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
            let cacheKey = "this.reddah.getMyReportComments" + this.selectedArticleId;
            this.cacheService.removeItem(cacheKey);
            this.GetCommentsData(this.selectedArticleId);
        });
    }

    selectedReplyPlaceholder: string;
    showAddCommentFromChildren(event){
        this.selectedArticleId = event.articleId;
        this.selectedCommentId = event.commentId;
        this.showAddComment = true;
        this.selectedReplyPlaceholder = this.translate.instant("Comment.Comment") + this.reddah.getDisplayName(event.userName) + ":";

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

    isMe(userName){
        return userName==this.reddah.getCurrentUser();
    }

    async delete(article){
        const alert = await this.alertController.create({
            header: this.translate.instant("Confirm.Title"),
            message: this.translate.instant("Confirm.DeleteMessage"),
            buttons: [
            {
                text: this.translate.instant("Confirm.Cancel"),
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {}
            }, 
            {
                text: this.translate.instant("Confirm.Yes"),
                handler: () => {
                    //ui delete
                    this.articles.forEach((item, index)=>{
                        if(item.Id==article.Id){
                            this.articles.splice(index, 1);
                        }
                    })
                    this.localStorageService.store("Reddah_myreport",this.articles);
                    this.cacheService.clearGroup("MyReportPage");
                    
                    //serivce delete
                    let formData = new FormData();
                    formData.append("Id",JSON.stringify(article.Id));
                    this.reddah.deleteArticle(formData).subscribe(data=>{
                        
                    });
                }
            }]
        });

        await alert.present().then(()=>{});
    }
}