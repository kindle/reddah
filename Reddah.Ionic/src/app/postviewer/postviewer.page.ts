import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { Article } from '../article';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { Location } from '@angular/common';
import { AddCommentPage } from '../add-comment/add-comment.page';
import { ReddahService } from '../reddah.service';
import { ArticlePopPage } from '../article-pop/article-pop.page';
import { CacheService } from "ionic-cache";
import { UserPage } from '../user/user.page';

@Component({
    selector: 'app-postviewer',
    templateUrl: './postviewer.page.html',
    styleUrls: ['./postviewer.page.scss'],
})
export class PostviewerPage implements OnInit {
    @Input() article: Article;
    authoronly=true;

    constructor(
        public modalController: ModalController,
        private location: Location,
        public reddah : ReddahService,
        private popoverController: PopoverController,
        private cacheService: CacheService,
    ) { }

    commentsData: any;

    ngOnInit() {
        this.loadComments();
    }

    async presentPopover(ev: any) {
        const popover = await this.popoverController.create({
            component: ArticlePopPage,
            event: ev,
            translucent: true
        });
        return await popover.present();
    }

    loadComments(){
        let cacheKey = "this.reddah.getComments" + this.article.Id;
        let request = this.reddah.getComments(this.article.Id)

        this.cacheService.loadFromObservable(cacheKey, request)
        .subscribe(data => 
        {
            console.log(data);
            this.commentsData = data;
        });
    }

    async viewer(event){
        var target = event.target || event.srcElement || event.currentTarget;
        if(target.tagName.toUpperCase()==="IMG"){
            const modal = await this.modalController.create({
                component: ImageViewerComponent,
                componentProps: {
                    imgSourceArray: [target.src],
                    imgTitle: "",
                    imgDescription: ""
                },
                cssClass: 'modal-fullscreen',
                keyboardClose: true,
                showBackdrop: true
            });
    
            return await modal.present(); 
        }
    }

    goback(){
        this.location.back();
    }


    private lastScrollTop: number = 0;
    direction: string = "up";

    
    header: any;
    sticky: number;
    

    onScroll($event){
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

        console.log(this.sticky+"_"+$event.detail.scrollTop);
        if ($event.detail.scrollTop > this.sticky) {
            header.classList.add("sticky");
            console.log('add class')
        } else {
            header.classList.remove("sticky");
            console.log('remove class')
        }
    }

    showEditBox=false;

    async addNewComment(){
        //show the whole write comment box
        this.direction = 'up';
        //show text area, hide input single line
        this.showEditBox = true;
        //change submit button state to disabled
        this.submitClicked = false;
        console.log(this.selectedCommentId);
    }

    childCommentClick($event){
        this.selectedCommentId = $event.commentId;
        this.addNewComment();
    }

    @ViewChild('newComment') newComment;

    async newPopComment(articleId: number, commentId: number){
        
        const addCommentModal = await this.modalController.create({
            component: AddCommentPage,
            componentProps: { 
                articleId: articleId,
                commentId: commentId,
                text: this.newComment.value,
            }
        });
        
        await addCommentModal.present();
        const { data } = await addCommentModal.onDidDismiss();
        if(data.action=='submit'){
            this.newComment.value = "";
            let cacheKey = "this.reddah.getComments" + this.article.Id;
            this.cacheService.removeItem(cacheKey);
            this.loadComments();
        }
        else if(data.action=='cancel'){
            this.newComment.value = data.text;
        }

    }

    bookmark(){
        alert('bookmark');
    }

    share(){
        alert('share');
    }

    popover(){
        alert('show menu to report, delete.');
    }

    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            }
        });
          
        await userModal.present();
    }

    showFacePanel = false;
    toggleFacePanel(){
        this.showFacePanel= !this.showFacePanel;
    }

    handleSelection(face) {
        this.newComment.value += face;
    }

    selectedCommentId = -1;
    submitClicked = false;
    async submit() {
        this.submitClicked = true;
        
        this.reddah.addComments(this.article.Id, this.selectedCommentId, this.newComment.value)
        .subscribe(result => 
        {
            if(result.Success==0)
            { 
                let cacheKey = "this.reddah.getComments" + this.article.Id;
                this.cacheService.removeItem(cacheKey);
                this.loadComments();
                this.showEditBox = false;
            }
            else
            {
                alert(result.Message);
            }
        });
        
    }
}
