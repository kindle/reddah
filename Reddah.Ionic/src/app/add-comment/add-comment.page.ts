import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-add-comment',
  templateUrl: './add-comment.page.html',
  styleUrls: ['./add-comment.page.scss'],
})
export class AddCommentPage implements OnInit {

  @Input() articleId: number
  @Input() commentId: number

  commentContent: string;

  constructor(
    private modalController: ModalController,
    private reddahService: ReddahService,
    private localStorageService: LocalStorageService) { }

  ngOnInit() {
    
  }

  async submit() {
      //alert(`write some...aid:${this.articleId},cid:${this.commentId},content:${this.commentContent}`);
      let jwt = this.reddahService.getCurrentJwt();
    
      this.reddahService.addComments(jwt, this.articleId, this.commentId, this.commentContent)
      .subscribe(result => 
          {
              if(result.Success==0)
              { 
                this.modalController.dismiss(true); 
              }
              else{
                alert(result.Message);
              }
          }
      );
      
  }

  AddComment():void {
    
  }

  async cancel() {
      await this.modalController.dismiss(false);
  }

}
