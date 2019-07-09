import { Component, OnInit, ViewChild, Input, Renderer } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController, AlertController, NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UserPage } from '../../common/user/user.page';
import { TimelineCommentPopPage } from '../../common/timeline-comment-pop.page'
import { ImageViewerComponent } from '../../common/image-viewer/image-viewer.component';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ArticleTextPopPage } from '../../common/article-text-pop.page'
import { LocationPage } from '../../common/location/location.page';

@Component({
    selector: 'app-tsviewer',
    templateUrl: 'tsviewer.page.html',
    styleUrls: ['tsviewer.page.scss']
})
export class TsViewerPage implements OnInit {

    @Input() article: any;

    formData: FormData;

    @ViewChild('newComment') newComment;
    
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
        private navParams: NavParams,
        ){
            //this.userName = this.reddah.getCurrentUser();
    }

    userPhoto: string = "assets/icon/anonymous.png";
    getUserInfo(){
        this.formData = new FormData();
        this.formData.append("targetUser", this.article.UserName);

        this.reddah.getUserInfo(this.formData)
            .subscribe(userInfo => 
            {
                console.log(JSON.stringify(userInfo));
                
                if(userInfo.Photo!=null)
                    this.userPhoto = userInfo.Photo;
                
            }
        );
    }
    
    async ngOnInit(){
        this.getUserInfo();
        //for comment init
        this.selectedArticleId = this.article.Id;
        this.selectedCommentId = -1;

        this.GetCommentsData(this.article.Id);
    }

    ionViewDidLoad() {
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        console.log(locale);
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
       
        let currentUser = this.reddah.getCurrentUser();
        if(action=="add"){
            if(this.article.GroupName.length==0){
                this.article.GroupName = currentUser;
            }
            else {
                this.article.GroupName += "," + currentUser;
            }
        }

        if(action=="remove"){
            if(this.article.GroupName==currentUser){
                this.article.GroupName="";
            }
            else {
                let groupNames = this.article.GroupName.split(',');
                groupNames.forEach((gitem, gindex, galias)=>{
                    if(gitem==currentUser){
                        groupNames.splice(gindex, 1);
                    }
                });
                this.article.GroupName = groupNames.join(',');
            }
        }
        
        return false;
    }

    async viewer(index, imageSrcArray) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
                index: index,
                imgSourceArray: imageSrcArray,
                imgTitle: "",
                imgDescription: ""
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
        let temp = this.commentData.get(this.selectedArticleId);
        temp.Comments.push({'Id': 0, 'ArticleId': this.selectedArticleId, 'ParentId': this.selectedCommentId, 
            'Content': this.newComment.value, 'UserName': this.reddah.getCurrentUser()});
        
        this.reddah.addComments(this.selectedArticleId, this.selectedCommentId, this.newComment.value)
        .subscribe(data=>{
            this.newComment.value = "";
            let cacheKey1 = "this.reddah.getTimelineComments" + this.selectedArticleId;
            this.cacheService.removeItem(cacheKey1);
            let cacheKey2 = "this.reddah.getComments" + this.selectedArticleId;
            this.cacheService.removeItem(cacheKey2);
            this.cacheService.clearGroup("MyTimeLinePage");
            this.GetCommentsData(this.selectedArticleId);
        });
    }

    selectedReplyPlaceholder: string;
    showAddCommentFromChildren(event){
        this.selectedArticleId = event.articleId;
        this.selectedCommentId = event.commentId;
        this.selectedReplyPlaceholder = "回复" + this.reddah.getDisplayName(event.userName) + ":";

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
                userName: userName,
            },
        });
        
        await userModal.present();
        const { data } = await userModal.onDidDismiss();
        if(data){
            this.close();
        }
    }

    async fullText(text){
        const textModal = await this.modalController.create({
            component: ArticleTextPopPage,
            componentProps: { text: text }
        });
          
        await textModal.present();
    }

    async close(){
        await this.modalController.dismiss();
    }
    
    async goLocation(location){
        const modal = await this.modalController.create({
            component: LocationPage,
            componentProps: { location: JSON.parse(location) }
        });
    
        await modal.present();
    }
}
