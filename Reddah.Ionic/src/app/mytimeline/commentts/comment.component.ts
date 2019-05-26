import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular'
import { CommentPopPage } from '../../common/comment-pop.page'
import { UserPage } from '../../common/user/user.page';
import { ReddahService } from '../../reddah.service';

@Component({
  selector: 'ts-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentTimelineComponent implements OnInit {

  @Input() data;
  @Input() depth: number;
  @Input() ptext;
  @Input() pauthor;
  @Input() authoronly: boolean;
  @Input() articleauthor;

  constructor(
      public reddah: ReddahService,
      private popoverController: PopoverController,
      private modalController: ModalController,

  ) { }

  ngOnInit() {
      console.log(JSON.stringify(this.data));
  }

  async presentPopover(ev: any) {
      const popover = await this.popoverController.create({
          component: CommentPopPage,
          event: ev,
          translucent: true
      });
      return await popover.present();
  }

  foo(){
    
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

  @Output()
  reply = new EventEmitter<any>();

  showAddComment(comment){
    //console.log(JSON.stringify(comment))
    console.log(comment.Id+"_"+comment.ArticleId);
    this.reply.emit({'articleId': comment.ArticleId, 'commentId': comment.Id, 'userName': comment.UserName});

  }

  pop(event){
    this.reply.emit(event);
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
  
}
