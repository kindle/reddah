import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular'
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

    @Input() data;
    localComments: any;
    @Input() depth: number;
    @Input() ptext;
    @Input() pauthor;
    @Input() authoronly: boolean;
    @Input() articleauthor;
    @Input() count: number;

    @Output() commentClick = new EventEmitter();

    //totalCommentCount: number;

    userName;
    constructor(
        public reddah: ReddahService,
        private popoverController: PopoverController,
        private modalController: ModalController,
        private cacheService: CacheService,
        private localStorageService: LocalStorageService,
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
                this.localComments.sort((a,b)=> b.Count-a.Count);
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
            }
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
            this.init(data.Comments);
        });
    }

    newComment(articleId: number, commentId: number){
        alert(`write some...aid:${articleId},cid:${commentId}`);
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
        console.log(cacheKey);
        this.cacheService.clearGroup(cacheKey);
        this.cacheService.removeItem(cacheKey);

        if(comment.like)
            this.localStorageService.store(`Reddah_CommentLike_${this.userName}_${comment.Id}`, "");
        else
            this.localStorageService.clear(`Reddah_CommentLike_${this.userName}_${comment.Id}`);

        
    }


    popover(){
        alert('show menu to report, delete.');
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
  
    async addNewComment(articleId, commentId){
        //show parent(postviewer.page) show comment box
        this.commentClick.emit({articleId: articleId, commentId: commentId});
    }
}
