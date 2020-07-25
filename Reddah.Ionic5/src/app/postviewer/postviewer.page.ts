import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, PopoverController, AlertController, IonContent } from '@ionic/angular';
import { Article } from '../model/article';
import { ImageViewerComponent } from '../common/image-viewer/image-viewer.component';
import { Location } from '@angular/common';
import { ReddahService } from '../reddah.service';
import { ArticlePopPage } from '../common/article-pop.page';
import { CacheService } from "ionic-cache";
import { UserPage } from '../common/user/user.page';
import { SearchPage } from '../common/search/search.page';
import { AddTimelinePage } from '../mytimeline/add-timeline/add-timeline.page';
import { PubPage } from '../tabs/publisher/pub/pub.page';
import { AddFeedbackPage } from '../mytimeline/add-feedback/add-feedback.page';
import { ShareChooseChatPage } from '../chat/share-choose-chat/share-choose-chat.page';
import { SettingFontPage } from '../settings/setting-font/setting-font.page';
import { AddArticlePage } from '../tabs/publisher/add-article/add-article.page';
import { LocationPage } from '../common/location/location.page';
import { ArticleTextPopPage } from '../common/article-text-pop.page';

@Component({
    selector: 'app-postviewer',
    templateUrl: './postviewer.page.html',
    styleUrls: ['./postviewer.page.scss'],
})
export class PostviewerPage implements OnInit {
    @Input() article: Article;
    @Input() preview = false;
    authoronly=true;
    @Input() isTopic = false;

    userName;
    constructor(
        public modalController: ModalController,
        private location: Location,
        public reddah : ReddahService,
        private popoverController: PopoverController,
        private cacheService: CacheService,
        private alertController: AlertController,
    ) { 
        this.userName = this.reddah.getCurrentUser();
    }


    isMe(userName){
        return userName==this.reddah.getCurrentUser();
    }

    async goLocation(location){
        const modal = await this.modalController.create({
            component: LocationPage,
            componentProps: { location: JSON.parse(location) },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
    
        await modal.present();
    }

    async topicViewer(index, imageSrcArray) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
                index: index,
                imgSourceArray: this.reddah.preImageArray(imageSrcArray),
                imgTitle: "",
                imgDescription: "",
                showDownload: true,
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
    
        return await modal.present();
    }

    async fullText(text){
        const textModal = await this.modalController.create({
            component: ArticleTextPopPage,
            componentProps: { text: text },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await textModal.present();
    }

    commentsData: any;

    effeciveRead;
    ngOnInit() {
        this.reddah.getUserPhotos(this.article.UserName);

        if(!this.preview){
            this.effeciveRead = setTimeout(() => {
                if(!this.article.Read&&!this.reddah.isPointDone(this.reddah.pointTasks[1])){
                    this.reddah.getPointRead().subscribe(data=>{
                        if(data.Success==0||data.Success==3){ 
                            this.reddah.setPoint('Read', data.Message.GotPoint);
                            if(data.Success==0){
                                this.reddah.toast(
                                    this.reddah.instant("Point.TaskReadTitle")+
                                    this.reddah.lan2(
                                        " +"+data.Message.GotPoint+"/"+this.reddah.pointTasks[1].max,
                                        this.reddah.instant("Point.Fen")),
                                "primary");
                            }
                            this.reddah.getUserPhotos(this.userName);
                        }
                    });
                }
            },5000);
        }
    }

    ionViewDidEnter(){
        //console.log(this.article)
        if(!this.preview)
            this.loadComments();
    }

    async focus(){
        this.reddah.focusPub(this.userName, this.article.UserName);
    }

    async enterPub(){
        const modal = await this.modalController.create({
            component: PubPage,
            componentProps: { 
                userName: this.article.UserName
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
    }
/*
    async unFocus(){
        const alert = await this.alertController.create({
            header: "",
            message: `${this.reddah.instant("Pop.StillUnfocus")}${this.reddah.getDisplayName(this.article.UserName, 100)} ${this.reddah.instant("Pop.UnfocusMessage")}`,
            buttons: [
                {
                    text: this.reddah.instant("Pop.StillFocus"),
                    role: 'cancel',
                    cssClass: 'cssdark',
                    handler: () => {}
                    }, 
                {
                    text: this.reddah.instant("Pop.StillUnfocus"),
                    cssClass:'cssdanger',
                    handler: () => {
                        this.reddah.unFocusPub(this.userName, this.article.UserName);
                    }
                }
            ]
        });

        await alert.present().then(()=>{});
            
        
    }
*/

    async presentPopover(ev: any) {
        const popover = await this.popoverController.create({
            component: ArticlePopPage,
            componentProps: { ArticleId: this.article.Id },
            event: ev,
            translucent: true,
            cssClass: 'article-pop-popover'
        });
        
        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data==1)//share to friend
        {
            const modal = await this.modalController.create({
                component: ShareChooseChatPage,
                componentProps: { 
                    title: this.reddah.instant("Common.Choose"),
                    article: this.article,
                    swipeToClose: true,
                    presentingElement: await this.modalController.getTop(),
                },
                cssClass: "modal-fullscreen",
            });
              
            await modal.present();
            const { data } = await modal.onDidDismiss();
            if(data){
                this.reddah.getSharePoint();
            }
        }
        else if(data==2)//share to timeline
        {
            this.goPost(4);
        }
        else if(data==4){//report abuse
            //use share function
            this.feedback();
        }
        else if(data==5){//change font size
            const modal = await this.modalController.create({
                component: SettingFontPage,
                componentProps: {},
                cssClass: "modal-fullscreen",
                swipeToClose: true,
                presentingElement: await this.modalController.getTop(),
            });
            
            await modal.present();
        }
    }

    async goPost(postType){
        const postModal = await this.modalController.create({
            component: AddTimelinePage,
            componentProps: { 
                postType: postType,
                article: this.article
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            this.reddah.getSharePoint();
        }
    }

    async feedback() {
        const modal = await this.modalController.create({
            component: AddFeedbackPage,
            componentProps: { 
                title: this.reddah.instant("Pop.Report"),
                desc: this.reddah.instant("Pop.ReportReason"),
                feedbackType: 4,
                article: this.article
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
    }

    @ViewChild('commentlist') commentlist;

    async loadComments(){
        let cacheKey = "this.reddah.getComments" + this.article.Id;
        let request = this.reddah.getComments(this.article.Id)
        
        this.cacheService.loadFromObservable(cacheKey, request, cacheKey)

        //this.reddah.getComments(this.article.Id)
        .subscribe(data => 
        {
            this.commentsData = data;
            this.commentlist.init(data.Comments);
            //this.commentlist.data = data.Comments;
            //this.commentlist.init();
        });
    }

    async viewer(event){
        var target = event.target || event.srcElement || event.currentTarget;
        if(target.tagName.toUpperCase()==="IMG"){
            const modal = await this.modalController.create({
                component: ImageViewerComponent,
                componentProps: {
                    index:0,
                    imgSourceArray: this.reddah.preImageArray([target.src]),
                    imgTitle: "",
                    imgDescription: ""
                },
                cssClass: 'modal-fullscreen',
                keyboardClose: true,
                showBackdrop: true,
                swipeToClose: true,
                presentingElement: await this.modalController.getTop(),
            });
    
            return await modal.present(); 
        }
    }

    goback(){
        this.location.back();
        clearTimeout(this.effeciveRead);
    }

    @ViewChild('commentbox') commentbox;
    childCommentClick($event){
        this.commentbox.addNewComment(this.article.Id, $event.commentId, $event.commentUserName);
    }

    childReloadComments(event){
        //console.log('childReloadComments')
        this.loadComments();
        if(!this.reddah.isPointDone(this.reddah.pointTasks[4])){
            this.reddah.getPointComment().subscribe(data=>{
                //console.log(data)
                if(data.Success==0||data.Success==3){ 
                    this.reddah.setPoint('Comment', data.Message.GotPoint);
                    if(data.Success==0){
                        this.reddah.toast(
                            this.reddah.instant("Point.TaskCommentTitle")+
                            this.reddah.lan2(
                                " +"+data.Message.GotPoint+"/"+this.reddah.pointTasks[4].max,
                                this.reddah.instant("Point.Fen")),
                        "primary");
                    }
                }
            });
        }
    }

    async close() {
        clearTimeout(this.effeciveRead);
        await this.modalController.dismiss();
    }


    async goUser(userName){
        let isNormalUser = true;
        //if(this.reddah.appData('usertype'+userName)==1)
        if(userName.length==32)
            isNormalUser = false;

        const modal = await this.modalController.create({
            component: isNormalUser?UserPage:PubPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
    }

    async goSearch(key){
        const userModal = await this.modalController.create({
            component: SearchPage,
            componentProps: { 
                key: key,
                type: 0,//article only
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await userModal.present();
    }

    asNormalUser = true;
    async switchToAdmin(){
        this.asNormalUser = !this.asNormalUser;
    }

    isAdmin(){
        //pub admins
        let admins = this.reddah.appData("useradmins_"+this.article.UserName).split(',');
        // system admin
        let superAdmin = this.reddah.checkPermission("2");//2: delete post permission
        return admins.includes(this.userName)||superAdmin;
    }

    async delete(){
            const alert = await this.alertController.create({
              header: this.reddah.instant("Confirm.Title"),
              message: this.reddah.instant("Confirm.DeleteMessage"),
              buttons: [
                {
                    text: this.reddah.instant("Confirm.Cancel"),
                    cssClass: 'secondary',
                    handler: _ => {}
                }, 
                {
                    text: this.reddah.instant("Comment.Delete"),
                    handler: () => {
                        let formData = new FormData();
                        formData.append("Id", JSON.stringify(this.article.Id));
                        this.reddah.deleteArticle(formData).subscribe(result=>{
                            if(result.Success==0){
                                
                            }
                            else{
                                let msg = this.reddah.instant(`Service.${result.Success}`);
                                this.reddah.toast(msg, "danger");
                            }
                        });
                    }
                }
            ]
        });
    
        await alert.present();
        
    }

    async onScroll(event){
        if(!this.preview)
            this.commentbox.onScroll(event)
    }

    async edit(){
        const modal = await this.modalController.create({
            component: AddArticlePage,
            componentProps: { 
                targetUserName: this.article.UserName,
                article: this.article,
                action: 'AdminEdit'
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data){
            this.close();
        }
    }

}
