import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PopoverController } from '@ionic/angular'
import { CommentPopPage } from '../article-pop/comment-pop.page'

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
      private popoverController: PopoverController
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

  
  
}
