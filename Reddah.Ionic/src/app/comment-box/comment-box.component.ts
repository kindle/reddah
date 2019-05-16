import { Component, OnInit, ViewChild, Input, Output } from '@angular/core';
import { ReddahService } from '../reddah.service';
import { CacheService } from "ionic-cache";

@Component({
    selector: 'app-comment-box',
    templateUrl: './comment-box.component.html',
    styleUrls: ['./comment-box.component.scss']
})
export class CommentBoxComponent implements OnInit {

    @ViewChild('newComment') newComment;

    constructor(
        public reddah : ReddahService,
        private cacheService: CacheService,
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
        else if(currentScrollTop < this.lastScrollTop)
        {
            this.direction = 'up';
            this.showEditBox = false;
            this.selectedCommentId = -1
        }
        
        this.lastScrollTop = currentScrollTop;
        //total count as fixed header
        let header = document.getElementById("TotalComments");
        if(this.sticky==null)
            this.sticky = header.offsetTop;

        if ($event.detail.scrollTop > this.sticky) {
            header.classList.add("sticky");
        } else {
            header.classList.remove("sticky");
        }
    }


    showEditBox=false;

    selectedArticleId = -1;
    selectedCommentId = -1;
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
                    let cacheKey = "this.reddah.getComments" + this.selectedArticleId;
                    this.cacheService.removeItem(cacheKey);
                    //this.loadComments();
                    this.showEditBox = false;
                }
                else{
                    alert(result.Message);
                }
            }
        );
        
    }

}
