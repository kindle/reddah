import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { PopoverController, ModalController, AlertController, NavController } from '@ionic/angular'
import { CommentPopPage } from '../../common/comment-pop.page'
import { UserPage } from '../../common/user/user.page';
import { CommentReplyPage } from '../comment-reply/comment-reply.page';
import { ReddahService } from '../../reddah.service';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

    @Input() article;
    @Input() data;
    localComments: any;
    @Input() depth: number;
    @Input() ptext;
    @Input() pauthor;
    @Input() authoronly: boolean;
    @Input() normal;
    @Output() commentClick = new EventEmitter();
    //totalCommentCount: number;

    userName;
    constructor(
        public reddah: ReddahService,
        private popoverController: PopoverController,
        private modalController: ModalController,
        private cacheService: CacheService,
        private localStorageService: LocalStorageService,
        private alertController: AlertController,
        private zone: NgZone,
        private navController: NavController,
    ) { 
        this.userName = this.reddah.getCurrentUser();
    }

    ngOnInit() {
        if(this.data)
        {
            this.init(this.data.Comments); 
        }
    }

    init(comments) {
        this.localComments = comments.concat();
        //this.totalCommentCount = this.GetCommentCount(this.localComments, -1);
        this.localComments.forEach(comment=>{
        //  comment.CommentCount = this.GetCommentCount(this.localComments, comment.Id);
            comment.like = (this.localStorageService.retrieve(`Reddah_CommentLike_${this.userName}_${comment.Id}`)!=null)
            this.reddah.getUserPhotos(comment.UserName);
        });
        this.localComments.sort((a,b)=> b.Id-a.Id); 
        
    }

/*
    GetCommentCount(comments, id){
        //replies for current comment
        let count = comments.filter(c=>c.ParentId==id).reduce((sum,c)=>{return sum+1},0);
        if(count>0)
        {
            let subTotal = 0;
            comments.forEach((element) => {
                if(element.ParentId==id){
                    subTotal += this.GetCommentCount(comments, element.Id);
                }
            });
            return count + subTotal;
        }
        else{
            return 0;
        }
    }*/

    customPopoverOptions: any = {
        //header: 'Hair Color',
        //subHeader: 'Select your hair color',
        //message: 'Only select your dominant hair color'
    };

    async presentPopover(ev: any) {
        const popover = await this.popoverController.create({
            component: CommentPopPage,
            event: ev,
            translucent: true
        });
        return await popover.present();
    }

    sortComment(value){
        switch(value){
            case "oldest":
                this.localComments.sort((a,b)=> a.Id-b.Id);
                break;
            case "mostlike":
                this.localComments.sort((a,b)=> b.Up-a.Up);
                break;
            case "latest":
            default:
                this.localComments.sort((a,b)=> b.Id-a.Id);
                break;
        }
    }

    async viewReply(comments, comment){
        const replayModal = await this.modalController.create({
            component: CommentReplyPage,
            componentProps: { 
                comments: comments,
                comment: comment,
                normal: this.normal
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await replayModal.present();
        const { data } = await replayModal.onDidDismiss();
        if(data){
            //reload comments
            this.loadComments(comment.ArticleId)
        }

    }

    loadComments(articleId){
        let cacheKey = "this.reddah.getComments" + articleId;
        let request = this.reddah.getComments(articleId)

        this.cacheService.loadFromObservable(cacheKey, request, cacheKey)
        .subscribe(data => 
        {
            //this.data = data.Comments;
            this.init(data.Comments);
        });
    }

    
    likeComment(comment){
        comment.Up = comment.Up + (comment.like?-1:1);
        if(comment.Up<0)
            comment.Up=0;
        comment.like=!comment.like;

        let formData = new FormData();
        formData.append("id", JSON.stringify(comment.Id));
        formData.append("type", JSON.stringify(comment.like));
        this.reddah.commentLike(formData).subscribe(data=>{});

        let cacheKey = "this.reddah.getComments" + comment.ArticleId;
        
        this.cacheService.clearGroup(cacheKey);
        this.cacheService.removeItem(cacheKey);

        if(comment.like)
            this.localStorageService.store(`Reddah_CommentLike_${this.userName}_${comment.Id}`, "");
        else
            this.localStorageService.clear(`Reddah_CommentLike_${this.userName}_${comment.Id}`);

        
    }


    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName,
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await userModal.present();
    }
  
    async addNewComment(articleId, commentId, commentUserName){
        //show parent(postviewer.page) show comment box
        this.commentClick.emit({articleId: articleId, commentId: commentId, commentUserName: this.reddah.getDisplayName(commentUserName)});
    }

    canDelete(comment){
        let isMyComment = comment.UserName == this.userName;
        return !this.normal || isMyComment;
    }

    async delete(comment){
            const alertCtl = await this.alertController.create({
              header: this.reddah.instant("Confirm.Title"),
              message: this.reddah.instant("Confirm.DeleteMessage"),
              buttons: [
                {
                    text: this.reddah.instant("Confirm.Cancel"),
                    cssClass: 'secondary',
                    handler: _ => {}
                }, 
                {
                    text: this.reddah.instant("Comment.Delete"),
                    handler: () => {
                        let formData = new FormData();
                        formData.append("Id", JSON.stringify(comment.Id));
                        this.reddah.deleteComment(formData).subscribe(result=>{
                            if(result.Success==0){
                                let cacheKey = "this.reddah.getComments" + comment.ArticleId;
                                
                                this.cacheService.removeItem(cacheKey);
                                this.cacheService.clearGroup(cacheKey);
                                this.zone.run(()=>{
                                    this.localComments = this.localComments.filter(c => c.Id != comment.Id);
                                })
                                
                            }
                            else{
                                this.article.Count = this.article.Count + 1;
                                let msg = this.reddah.instant(`Service.${result.Success}`);
                                this.reddah.toast(msg, "danger")
                            }
                            
                        });
                        this.article.Count = this.article.Count>0?this.article.Count - 1:0;
                    }
                }
            ]
        });
    
        await alertCtl.present();
        /*const { data } = await alertCtl.onDidDismiss();
        if(data||!data){
            this.reloadComments.emit();
        }*/
    }

    async goback(){
        // close modal
        try {
            const element = await this.modalController.getTop();
            if (element) {
                element.dismiss();
                return;
            }
        } catch (error) {
        }
        this.navController.back();
    }

    translate(comment){
        comment.TranslateContent =  "...";
        comment.Translate = true;
        //console.log(comment)

        let app_id = this.reddah.qq_app_id;
        let app_key = this.reddah.qq_app_key;
        let time_stamp = new Date().getTime();
        let nonce_str = this.reddah.nonce_str();
        
        let params2 = {
            "app_id":app_id,
            "time_stamp":Math.floor(time_stamp/1000),
            "nonce_str":nonce_str,
            "text": this.reddah.summary(comment.Content, 200),
            "force":0,
            "candidate_langs":"",
            "sign":""
        }

        params2["sign"] = this.reddah.getReqSign(params2, app_key);
        this.reddah.getQqLanguageDetect(params2, app_key).subscribe(detect=>{
            if(detect.Success==0){
                console.log(detect.Message);
                let detectLan = JSON.parse(detect.Message).data.lang;

                let params3 = {
                    "app_id":app_id,
                    "time_stamp":Math.floor(time_stamp/1000),
                    "nonce_str":nonce_str,
                    "text": this.reddah.summary(comment.Content,200),
                    "source":detectLan,
                    "target":this.reddah.adjustLan(detectLan),
                    "sign":""
                }
        
                if(params3["source"]!=params3["target"]){
                    params3["sign"] = this.reddah.getReqSign(params3, app_key);
                    this.reddah.getQqTextTranslate(params3, app_key).subscribe(data=>{
                        //console.log(data)
                        let response3 = JSON.parse(data.Message)
                        let traslatedAnswer = response3.data.target_text;
                        //console.log(traslatedAnswer);
                        if(data.Success==0){
                            if(response3.ret!=0)
                            {
                                comment.TranslateContent =  this.reddah.instant('FedLogin.FailedMessage');;
                            }
                            else{
                                comment.TranslateContent =  traslatedAnswer;
                            }
                        }
                    });
                }
            }
        });
    }
}
