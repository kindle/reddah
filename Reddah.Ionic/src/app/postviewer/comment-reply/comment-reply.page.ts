import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController, ActionSheetController  } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserPage } from '../../common/user/user.page';
import * as HighCharts from 'highcharts';
var Highcharts = require('highcharts/highstock');

@Component({
    selector: 'app-comment-reply',
    templateUrl: 'comment-reply.page.html',
    styleUrls: ['comment-reply.page.scss']
})
export class CommentReplyPage implements OnInit {
    flagAddComment=false;

    async close(){
        await this.modalController.dismiss(this.flagAddComment);
    }

    @Input() comments: any;
    @Input() comment: any;

    @Output() commentClick = new EventEmitter();

    userName;
    constructor(public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        private renderer: Renderer,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private popoverController: PopoverController,
        private photoLibrary: PhotoLibrary,
        private cacheService: CacheService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        public actionSheetController: ActionSheetController,
        ){
        this.userName = this.reddah.getCurrentUser();
    }
    
    customPopoverOptions: any = {
        //header: 'Hair Color',
        //subHeader: 'Select your hair color',
        //message: 'Only select your dominant hair color'
    };

    sortComment(value){
        switch(value){
            case "oldest":
                this.comments.sort((a,b)=> a.Id-b.Id);
                break;
            case "mostlike":
                this.comments.sort((a,b)=> b.Down-a.Down);
                break;
            case "latest":
            default:
                this.comments.sort((a,b)=> b.Id-a.Id);
                break;
        }
    }

    ngOnInit(){
        this.comments.sort((a,b)=> b.Id-a.Id);
        this.allRepliesCount = this.GetCommentCount(this.comments, this.comment.Id);
    }

    allRepliesCount: number;
    childrenIds= [];

    GetCommentCount(comments, id){
        //replies for current comment
        let count = comments.filter(c=>c.ParentId==id).reduce((sum,c)=>{return sum+1},0);
        if(count>0)
        {
            let subTotal = 0;
            comments.forEach((element: any) => {
                if(element.ParentId==id){
                    this.childrenIds.push(element.Id);
                    element.like = (this.localStorageService.retrieve(`Reddah_CommentLike_${this.userName}_${element.Id}`)!=null)
                    subTotal += this.GetCommentCount(comments, element.Id);
                }
            });
            return count + subTotal;
        }
        else{
            return 0;
        }
    }

    GetUserNameByCommentId(comments, id){
        let fc = comments.filter(c=>c.Id==id);
        if(fc.length==1){
            return fc[0].UserName;
        }
        return "";
    }

    GetContentByCommentId(comments, id){
        let fc = comments.filter(c=>c.Id==id);
        if(fc.length==1){
            return fc[0].Content;
        }
        return "";
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

    childReloadComments($event){
        this.loadComments();
    }

    loadComments(){
        let cacheKey = "this.reddah.getComments" + this.comment.ArticleId;
        let request = this.reddah.getComments(this.comment.ArticleId)

        this.cacheService.loadFromObservable(cacheKey, request)
        .subscribe(data => 
        {
            this.flagAddComment = true;
            this.comments = data.Comments;
            this.comments.sort((a,b)=> b.Id-a.Id);
            this.allRepliesCount = this.GetCommentCount(this.comments, this.comment.Id);
        });
    }

    likeComment(reply){

        reply.Up = reply.Up + (reply.like?-1:1);
        if(reply.Up<0)
            reply.Up=0;
        reply.like=!reply.like;

        let formData = new FormData();
        formData.append("id", JSON.stringify(reply.Id));
        formData.append("type", JSON.stringify(reply.like));
        this.reddah.commentLike(formData).subscribe(data=>{});

        let cacheKey = "this.reddah.getComments" + reply.ArticleId;
        this.cacheService.clearGroup(cacheKey);
        this.cacheService.removeItem(cacheKey);

        if(reply.like)
            this.localStorageService.store(`Reddah_CommentLike_${this.userName}_${reply.Id}`, "");
        else
            this.localStorageService.clear(`Reddah_CommentLike_${this.userName}_${reply.Id}`);
    }
}
