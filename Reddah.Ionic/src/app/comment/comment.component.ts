import { Component, OnInit, Input } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular'
import { CommentPopPage } from '../article-pop/comment-pop.page'
import { UserPage } from '../user/user.page';
import { CommentReplyPage } from '../comment-reply/comment-reply.page';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  @Input() data;
  @Input() depth: number;
  @Input() ptext;
  @Input() pauthor;
  @Input() authoronly: boolean;
  @Input() articleauthor;

  constructor(
      private popoverController: PopoverController,
      private modalController: ModalController,
  ) { }

  ngOnInit() {
  }

  async presentPopover(ev: any) {
      const popover = await this.popoverController.create({
          component: CommentPopPage,
          event: ev,
          translucent: true
      });
      return await popover.present();
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

  htmlDecode(text: string) {
    var temp = document.createElement("div");
      temp.innerHTML = text;
      var output = temp.innerText || temp.textContent;
      temp = null;
      //output = output.replace(/src=\"\/uploadPhoto/g, "imageViewer src=\"\/\/\/reddah.com\/uploadPhoto");
      output = output.replace(/\"\/uploadPhoto/g, "\"\/\/\/reddah.com\/uploadPhoto");
      return output;
  }

  subpost(str: string, n: number) {
      var r = /[^\u4e00-\u9fa5]/g;
      if (str.replace(r, "mm").length <= n) { return str; }
      var m = Math.floor(n/2);
      for (var i = m; i < str.length; i++) {
          if (str.substr(0, i).replace(r, "mm").length >= n) {
              return str.substr(0, i) + "...";
          }
      }
      return str;
  }
  summary(str: string, n: number) {
      str = this.htmlDecode(str).replace(/<[^>]+>/g, "");
      return this.subpost(str, n);
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
          componentProps: { userName: userName }
      });
        
      await userModal.present();
  }
  
}
