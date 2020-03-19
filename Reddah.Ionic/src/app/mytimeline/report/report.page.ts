import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { IonInfiniteScroll, IonContent, LoadingController, NavController, PopoverController, ModalController, AlertController, } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { TranslateService } from '@ngx-translate/core';
import { UserPage } from '../../common/user/user.page';
import { ReportCommentPopPage } from '../../common/report-comment-pop.page'
import { ImageViewerComponent } from '../../common/image-viewer/image-viewer.component';
import { CacheService } from "ionic-cache";
import { ArticleTextPopPage } from '../../common/article-text-pop.page'

@Component({
    selector: 'app-report',
    templateUrl: 'report.page.html',
    styleUrls: ['report.page.scss']
})
export class ReportPage implements OnInit {
    userName: string;
    articles = [];
    loadedIds = [];
    formData: FormData;
    showAddComment = false;

    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    @ViewChild('newComment') newComment;
    @ViewChild('pageTop') pageTop: IonContent;
        
    loadData(event) {
        this.getReport(event);
    }

    goback(){
        this.modalController.dismiss();
    }

    goMessage(){}

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
    ){
        this.userName = this.reddah.getCurrentUser();
    }
    
    ngOnInit(){
        this.reddah.getUserPhotos(this.userName, true);

        let cachedArticles = this.localStorageService.retrieve("Reddah_report");
        let cachedIds = this.localStorageService.retrieve("Reddah_report_ids");
        if(cachedArticles){
            this.articles = JSON.parse(cachedArticles);
            this.loadedIds = JSON.parse(cachedIds);
        }

        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify([]));

        let cacheKey = "this.reddah.getReport";
        let request = this.reddah.getReport(this.formData);

        this.cacheService.loadFromObservable(cacheKey, request, "ReportPage")
        .subscribe(report => 
        {
            if(cachedArticles!=JSON.stringify(report))
            {
                this.articles = [];
                this.loadedIds = [];
                this.commentData = new Map();

                for(let article of report){
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

                this.localStorageService.store("Reddah_report",JSON.stringify(report));
                this.localStorageService.store("Reddah_report_ids",JSON.stringify(this.loadedIds));

            }
            else{
                for(let article of report){
                    this.GetCommentsData(article.Id);
                }
            }
        });
    }

    getReport(event):void {
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        
        let cacheKey = "this.reddah.getReport" + this.loadedIds.join(',');
        let request = this.reddah.getReport(this.formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "ReportPage")
        .subscribe(report => 
        {
            for(let article of report){
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

            this.localStorageService.store("Reddah_report", JSON.stringify(report));
            this.localStorageService.store("Reddah_report_ids", JSON.stringify(this.loadedIds));

            if(event){
                event.target.complete();
            }
        });

    }

    loadCommentTick = 0;
    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("ReportPage");
        this.loadedIds = [-1];
        this.articles = [];
        this.loadCommentTick++;
        this.localStorageService.clear("Reddah_report");
        this.localStorageService.clear("Reddah_report_ids");
        this.getReport(event);
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
            this.formData = new FormData();
            if(data==1)
            {
                this.formData.append("id", JSON.stringify(id))
                this.formData.append("data", JSON.stringify(1))
                this.formData.append("content", this.reddah.instant('Point.TaskReportAwardComment'))
                this.reddah.reportAward(this.formData).subscribe(data=>{
                    if(data.Success==0||data.Success==3){ 
                        if(data.Success==0){
                            //refresh
                        }
                    }
                });


            }

            if(data==2)
            {
                this.formData.append("id", JSON.stringify(id))
                this.formData.append("data", JSON.stringify(2))
                this.formData.append("content", this.reddah.instant('Point.TaskReportNoAwardComment'))
                this.reddah.reportAward(this.formData).subscribe(data=>{
                    if(data.Success==0||data.Success==3){ 
                        if(data.Success==0){
                            //refresh
                        }
                    }
                });
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
        let cacheKey = "this.reddah.getReportComments" + articleId+"_"+this.loadCommentTick;
        let request = this.reddah.getComments(articleId)

        this.cacheService.loadFromObservable(cacheKey, request, "MyReportPage")
        .subscribe(data => 
        {
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
            let cacheKey = "this.reddah.getReportComments" + this.selectedArticleId;
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
                    //ui delete
                    this.articles.forEach((item, index)=>{
                        if(item.Id==article.Id){
                            this.articles.splice(index, 1);
                        }
                    })
                    this.localStorageService.store("Reddah_report",this.articles);
                    this.cacheService.clearGroup("ReportPage");
                    
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