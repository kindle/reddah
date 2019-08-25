import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-add-comment',
    templateUrl: './add-comment.page.html',
    styleUrls: ['./add-comment.page.scss'],
})
export class AddCommentPage implements OnInit {

    @Input() articleId: number
    @Input() commentId: number
    @Input() text: string;

    commentContent: string;
    submitClicked=false;

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
    ) { }

    ngOnInit() {
        this.commentContent = this.text;
    }

    @ViewChild('newComment') newComment;


    showFacePanel = false;
    toggleFacePanel(){
        this.showFacePanel= !this.showFacePanel;
    }
    faceSelection(face) {
        this.newComment.value += face;
    }


    async submit() {
        this.submitClicked = true;
        //alert(`write some...aid:${this.articleId},cid:${this.commentId},content:${this.commentContent}`);
        let uid = this.reddah.uuidv4();
        this.reddah.addComments(this.articleId, this.commentId, this.commentContent, uid)
        .subscribe(result => 
            {
                if(result.Success==0)
                { 
                    this.modalController.dismiss({ action: 'submit', text: ''}); 
                }
                else{
                    alert(result.Message);
                }
            }
        );
        
    }

    AddComment():void {
        
    }

    async close() {
        await this.modalController.dismiss({ action: 'cancel', text: this.commentContent});
    }

}
