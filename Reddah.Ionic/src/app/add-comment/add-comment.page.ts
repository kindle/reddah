import { Component, OnInit, Input, ViewChild } from '@angular/core';
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
  submitClicked=false;

  constructor(
    private modalController: ModalController,
    public reddahService: ReddahService,
    private localStorageService: LocalStorageService) { }

  ngOnInit() {
    
  }

  @ViewChild('newComment') newComment;

  showFacePanel = false;
  toggleFacePanel(){
      this.showFacePanel= !this.showFacePanel;
  }

  handleSelection(face) {
      this.newComment.value += face;
  }

  async submit() {
      this.submitClicked = true;
      //alert(`write some...aid:${this.articleId},cid:${this.commentId},content:${this.commentContent}`);
      this.reddahService.addComments(this.articleId, this.commentId, this.commentContent)
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
