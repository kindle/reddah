import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular'
import { CommentPopPage } from '../article-pop/comment-pop.page'
import { UserPage } from '../user/user.page';
import { CommentReplyPage } from '../comment-reply/comment-reply.page';
import { ReddahService } from '../reddah.service';

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

    @Output() commentClick = new EventEmitter();

    totalCommentCount: number;

    constructor(
        public reddah: ReddahService,
        private popoverController: PopoverController,
        private modalController: ModalController,
    ) { }

    ngOnInit() {
        if(this.data)
        {
            this.localComments = this.data.Comments.concat();
            this.totalCommentCount = this.GetCommentCount(this.localComments, -1);
            this.localComments.forEach(comment=>{
                comment.CommentCount = this.GetCommentCount(this.localComments, comment.Id);
            });
            this.localComments.sort((a,b)=> b.Id-a.Id); 
        }
    }

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
    }

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
    }

    newComment(articleId: number, commentId: number){
        alert(`write some...aid:${articleId},cid:${commentId}`);
    }

    likeComment(commentId: number){
        alert(`like...cid:${commentId}`);
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
