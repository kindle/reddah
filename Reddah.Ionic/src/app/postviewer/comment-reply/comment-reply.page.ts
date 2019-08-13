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
                this.comments.sort((a,b)=> b.Count-a.Count);
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

    likeComment(id: number){

    }
}
