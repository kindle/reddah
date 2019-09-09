import { Component, OnInit, Output, EventEmitter, Input, NgZone } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ActionSheetController, AlertController  } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import { UserPage } from '../../common/user/user.page';

@Component({
    selector: 'app-comment-reply',
    templateUrl: 'comment-reply.page.html',
    styleUrls: ['comment-reply.page.scss']
})
export class CommentReplyPage implements OnInit {
    UpdateComment=false;

    async close(){
        await this.modalController.dismiss(this.UpdateComment);
    }

    @Input() comments: any;
    @Input() comment: any;
    @Input() normal;

    @Output() commentClick = new EventEmitter();

    userName;
    constructor(public reddah : ReddahService,
        public loadingController: LoadingController,
        public translate: TranslateService,
        public navController: NavController,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private alertController: AlertController,
        private cacheService: CacheService,
        public actionSheetController: ActionSheetController,
        private zone: NgZone,
        ){
        this.userName = this.reddah.getCurrentUser();
    }
    
    customPopoverOptions: any = {
        //header: 'Hair Color',
        //subHeader: 'Select your hair color',
        //message: 'Only select your dominant hair color'
    };

    sortComment(value){
        switch(value){
            case "oldest":
                this.comments.sort((a,b)=> a.Id-b.Id);
                break;
            case "mostlike":
                this.comments.sort((a,b)=> b.Up-a.Up);
                break;
            case "latest":
            default:
                this.comments.sort((a,b)=> b.Id-a.Id);
                break;
        }
    }

    ngOnInit(){
        this.comments.sort((a,b)=> b.Id-a.Id);
        this.allRepliesCount = this.GetCommentCount(this.comments, this.comment.Id);
    }

    allRepliesCount: number;
    childrenIds= [];

    GetCommentCount(comments, id){
        //replies for current comment
        let count = comments.filter(c=>c.ParentId==id).reduce((sum,c)=>{return sum+1},0);
        if(count>0)
        {
            let subTotal = 0;
            comments.forEach((element: any) => {
                if(element.ParentId==id){
                    this.childrenIds.push(element.Id);
                    element.like = (this.localStorageService.retrieve(`Reddah_CommentLike_${this.userName}_${element.Id}`)!=null)
                    subTotal += this.GetCommentCount(comments, element.Id);
                }
            });
            return count + subTotal;
        }
        else{
            return 0;
        }
    }

    GetUserNameByCommentId(comments, id){
        let fc = comments.filter(c=>c.Id==id);
        if(fc.length==1){
            return fc[0].UserName;
        }
        return "";
    }

    GetContentByCommentId(comments, id){
        let fc = comments.filter(c=>c.Id==id);
        if(fc.length==1){
            return fc[0].Content;
        }
        return "";
    }

    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName,
            }
        });
          
        await userModal.present();
    }

    childReloadComments($event){
        this.loadComments();
    }

    loadComments(){
        let cacheKey = "this.reddah.getComments" + this.comment.ArticleId;
        let request = this.reddah.getComments(this.comment.ArticleId)

        this.cacheService.loadFromObservable(cacheKey, request)
        .subscribe(data => 
        {
            this.UpdateComment = true;
            this.comments = data.Comments;
            this.comments.sort((a,b)=> b.Id-a.Id);
            this.allRepliesCount = this.GetCommentCount(this.comments, this.comment.Id);
        });
    }

    likeComment(reply){

        reply.Up = reply.Up + (reply.like?-1:1);
        if(reply.Up<0)
            reply.Up=0;
        reply.like=!reply.like;

        let formData = new FormData();
        formData.append("id", JSON.stringify(reply.Id));
        formData.append("type", JSON.stringify(reply.like));
        this.reddah.commentLike(formData).subscribe(data=>{});

        let cacheKey = "this.reddah.getComments" + reply.ArticleId;
        this.cacheService.clearGroup(cacheKey);
        this.cacheService.removeItem(cacheKey);

        if(reply.like)
            this.localStorageService.store(`Reddah_CommentLike_${this.userName}_${reply.Id}`, "");
        else
            this.localStorageService.clear(`Reddah_CommentLike_${this.userName}_${reply.Id}`);
    }

    canDelete(comment){
        let isMyComment = comment.UserName == this.userName;
        return !this.normal || isMyComment;
    }

    async delete(comment){
            const alertCtl = await this.alertController.create({
              header: this.translate.instant("Confirm.Title"),
              message: this.translate.instant("Confirm.DeleteMessage"),
              buttons: [
                {
                    text: this.translate.instant("Confirm.Cancel"),
                    cssClass: 'secondary',
                    handler: _ => {}
                }, 
                {
                    text: this.translate.instant("Comment.Delete"),
                    handler: () => {
                        let formData = new FormData();
                        formData.append("Id", JSON.stringify(comment.Id));
                        this.reddah.deleteComment(formData).subscribe(result=>{
                            if(result.Success==0){
                                let cacheKey = "this.reddah.getComments" + comment.ArticleId;
                                this.cacheService.removeItem(cacheKey);
                                this.cacheService.clearGroup(cacheKey);
                                
                                this.UpdateComment = true;
                                this.zone.run(()=>{
                                    this.comments = this.comments.filter(c => c.Id != comment.Id);
                                })
                            }
                            else{
                                let msg = this.translate.instant(`Service.${result.Success}`);
                                this.reddah.toast(msg, "danger")
                            }
                                
                        });
                    }
                }
            ]
        });
    
        await alertCtl.present();
        
    }
}
