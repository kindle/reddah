import { Component, OnInit, ViewChild, ElementRef, Input, Renderer2 } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LoadingController, NavController, PopoverController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ImageViewerComponent } from '../../common/image-viewer/image-viewer.component';
import { CacheService } from "ionic-cache";
import { TsViewerPage } from '../tsviewer/tsviewer.page'
import * as moment from 'moment';
import { TimelinePopPage } from '../../common/timeline-pop.page';
import { AddTimelinePage } from '../add-timeline/add-timeline.page';
import { MessagePage } from '../message/message.page';

@Component({
    selector: 'app-timeline',
    templateUrl: 'timeline.page.html',
    styleUrls: ['timeline.page.scss']
})
export class TimeLinePage implements OnInit {
    @Input() userName: string;

    articles = [];
    loadedIds = [];
    formData: FormData;

    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

    async goback(){
        await this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        private renderer: Renderer2,
        public modalController: ModalController,
        private popoverController: PopoverController,
        private cacheService: CacheService,
        ){
    }
    
    async ngOnInit(){
        this.reddah.getUserPhotos(this.userName, true);
        const loading = await this.loadingController.create({
            message: this.reddah.instant("Article.Loading"),
            spinner: 'circles',
        });
        await loading.present();
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getTimeline"+this.userName;
        //console.log(`cacheKey:${cacheKey}`);
        let request = this.reddah.getTimeline(this.formData);

        this.cacheService.loadFromObservable(cacheKey, request, "TimeLinePage"+this.userName)
        .subscribe(timeline => 
        {
            if(this.userName==this.reddah.getCurrentUser()){ 
                var localTime = new Date();
                this.articles.push({Id:0, CreatedOn: moment.utc(localTime).add(-1, 'minutes').format("YYYY-MM-DDTHH:mm:ss").toString(), Abstract:"",Content:""});  
            }
            for(let article of timeline){
                this.articles.push(article);
                this.loadedIds.push(article.Id);
            }
            loading.dismiss();
        });

        this.isFriend = this.reddah.appData('userisfriend_'+this.userName+'_'+this.reddah.getCurrentUser())==1;
        
        this.nonFriendAllowTen = this.reddah.appData('userallowtentimeline_'+this.userName)==1;
    }

    async clearCacheAndReload(){
        this.cacheService.clearGroup("TimeLinePage"+this.userName);
        this.articles = [];
        this.loadedIds = [];
        this.ngOnInit();
    }
  
    isFriend;
    nonFriendAllowTen;

    getTimeline(event):void {
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getTimeline" + this.userName + this.loadedIds.join(',');
        //console.log(`loadmore_cacheKey:${cacheKey}`);
        let request = this.reddah.getTimeline(this.formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "TimeLinePage"+this.userName)
        .subscribe(timeline => 
        {
            for(let article of timeline){
                if(this.isFriend||this.isMe()||
                    (!this.isFriend&&this.articles.length<10))
                {
                    this.articles.push(article);
                    this.loadedIds.push(article.Id);
                }
            }
            if(event)
                event.target.complete();
        });

    }

    loadData(event) {
        this.getTimeline(event);
    }

    @ViewChild('headerStart')
    headerStart:ElementRef;
    @ViewChild('headerOnScroll')
    headerOnScroll:ElementRef;
    @ViewChild('timelineCover')
    timelineCover:ElementRef;
    

    onScroll($event) {
        //console.log($event.detail.scrollTop+" "+this.timelineCover.nativeElement.scrollHeight)
        let offset = this.timelineCover.nativeElement.scrollHeight - $event.detail.scrollTop;
        if(offset>=250)
        {
            this.renderer.setStyle(this.headerStart.nativeElement, 'visibility', 'visible');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
            this.renderer.setStyle(this.headerStart.nativeElement, 'opacity', '8');
        }
        else if(offset<250 && offset>=150)
        {
            //console.log('start change'+offset)
            let opacity = (offset-150)/100;
            if(opacity<0) opacity=0;
            this.renderer.setStyle(this.headerStart.nativeElement, 'opacity', opacity + '');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
        }
        else if(offset<150 && offset>=0){
            let opacity = (1-(offset-0)/100);
            if(opacity>1) opacity=1;
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'opacity', opacity + '');
        }
        else
        {
            this.renderer.setStyle(this.headerStart.nativeElement, 'visibility', 'hidden');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'visibility', 'visible');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'opacity', '8');
        }
    }

    async viewer(index, imageSrcArray) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
                index: index,
                imgSourceArray: this.reddah.preImageArray(imageSrcArray),
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

    async goTsViewer(article){
        const userModal = await this.modalController.create({
            component: TsViewerPage,
            componentProps: { 
                article: article
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await userModal.present();
    }

    async post(ev: any) {
        const popover = await this.popoverController.create({
            component: TimelinePopPage,
            animated: false,
            translucent: true,
            cssClass: 'post-option-popover'
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data==1||data==2||data==3){
            //data=1: take a photo, data=2: lib photo, data=3: lib video
            this.goPost(data);
        }
    }

    async goPost(postType){
        const postModal = await this.modalController.create({
            component: AddTimelinePage,
            componentProps: { postType: postType },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            this.clearCacheAndReload();
        }
    }

    async goMessage(){
        const modal = await this.modalController.create({
            component: MessagePage,
            componentProps: {},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
    }

    isMe(){
        return this.userName==this.reddah.getCurrentUser();
    }
}
