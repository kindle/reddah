import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { CacheService } from "ionic-cache";
import { AddCommentPage } from '../add-comment/add-comment.page';

@Component({
    selector: 'app-comment-box',
    templateUrl: './comment-box.component.html',
    styleUrls: ['./comment-box.component.scss']
})
export class CommentBoxComponent implements OnInit {

    @ViewChild('newComment') newComment;
    @Input() count: number;
    @Input() bookmark: number;
    @Input() selectedArticleId: number;
    @Input() selectedCommentId: number;
    @Output() reloadComments = new EventEmitter();
    commentContent: string;

    constructor(
        public reddah : ReddahService,
        private cacheService: CacheService,
        private modalController: ModalController,
    ) { }

    ngOnInit() {
    }

    private lastScrollTop: number = 0;
    direction: string = "up";
    
    header: any;
    sticky: number;

    onScroll($event)
    {
        let currentScrollTop = $event.detail.scrollTop;

        if(currentScrollTop > this.lastScrollTop)
        {
            this.direction = 'down';
        }
        else
        {
            this.direction = 'up';
            this.showEditBox = false;
            this.selectedCommentId = -1
        }
        
        this.lastScrollTop = currentScrollTop;
        //total count as fixed header
        try{
            let header = document.getElementById("TotalComments");
            if(this.sticky==null)
                this.sticky = header.offsetTop;

            if ($event.detail.scrollTop > this.sticky) {
                header.classList.add("sticky");
            } else {
                header.classList.remove("sticky");
            }
        }
        catch(e){}
    }


    showEditBox=false;

    async addNewComment(articleId, commmentId){
        //show the whole write comment box
        this.direction = 'up';
        //show text area, hide input single line
        this.showEditBox = true;
        //change submit button state to disabled
        this.submitClicked = false;

        this.selectedArticleId = articleId;
        this.selectedCommentId = commmentId;
        console.log("selectedArticleId:"+this.selectedArticleId);
        console.log("selectedCommentId:"+this.selectedCommentId);

        setTimeout(() => {
            this.newComment.setFocus();
        },150);
    }

    showFacePanel = false;
    toggleFacePanel(){
        this.showFacePanel= !this.showFacePanel;
    }

    handleSelection(face) {
        this.newComment.value += face;
    }

    submitClicked = false;
    async submit() {
        this.submitClicked = true;
        
        this.reddah.addComments(this.selectedArticleId, this.selectedCommentId, this.newComment.value)
        .subscribe(result => 
        {
            if(result.Success==0)
            { 
                this.commentContent = "";
                let cacheKey1 = "this.reddah.getComments" + this.selectedArticleId;
                this.cacheService.removeItem(cacheKey1);
                let cacheKey2 = "this.reddah.getTimelineComments" + this.selectedArticleId;
                this.cacheService.removeItem(cacheKey2);
                this.reloadComments.emit();
                this.showEditBox = false;
            }
            else{
                alert(result.Message);
            }
        });
        
    }

    async newPopComment(articleId: number, commentId: number){
        
        const addCommentModal = await this.modalController.create({
            component: AddCommentPage,
            componentProps: { 
                articleId: articleId,
                commentId: commentId,
                text: this.commentContent,
            }
        });
        
        await addCommentModal.present();
        const { data } = await addCommentModal.onDidDismiss();
        if(data){
            this.commentContent = "";
            let cacheKey = "this.reddah.getComments" + this.selectedArticleId;
            this.cacheService.removeItem(cacheKey);
            this.reloadComments.emit();
        }

    }
}
