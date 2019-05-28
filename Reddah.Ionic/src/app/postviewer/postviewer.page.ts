import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { Article } from '../model/article';
import { ImageViewerComponent } from '../common/image-viewer/image-viewer.component';
import { Location } from '@angular/common';
import { ReddahService } from '../reddah.service';
import { ArticlePopPage } from '../common/article-pop.page';
import { CacheService } from "ionic-cache";
import { UserPage } from '../common/user/user.page';
import { SearchPage } from '../common/search/search.page';

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
            translucent: true,
            cssClass: 'postviewer-popover'
        });
        return await popover.present();
    }

    @ViewChild('commentlist') commentlist;

    loadComments(){
        let cacheKey = "this.reddah.getComments" + this.article.Id;
        let request = this.reddah.getComments(this.article.Id)

        this.cacheService.loadFromObservable(cacheKey, request)
        .subscribe(data => 
        {
            console.log(data);
            this.commentsData = data;
            this.commentlist.init(data.Comments);
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

    @ViewChild('commentbox') commentbox;
    childCommentClick($event){
        this.commentbox.addNewComment(this.article.Id, $event.commentId);
    }

    childReloadComments($event){
        this.loadComments();
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

    async goSearch(key){
        const userModal = await this.modalController.create({
            component: SearchPage,
            componentProps: { 
                key: key,
                type: 0,//article only
            }
        });
          
        await userModal.present();
    }

}
