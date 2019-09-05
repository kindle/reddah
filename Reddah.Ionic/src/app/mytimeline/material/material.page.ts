import { Component, OnInit, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { ImageViewerComponent } from '../../common/image-viewer/image-viewer.component';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TsViewerPage } from '../tsviewer/tsviewer.page'
import * as moment from 'moment';
import { TimelinePopPage } from '../../common/timeline-pop.page';
import { AddTimelinePage } from '../add-timeline/add-timeline.page';
import { MessagePage } from '../message/message.page';

@Component({
    selector: 'app-material',
    templateUrl: 'material.page.html',
    styleUrls: ['material.page.scss']
})
export class MaterialPage implements OnInit {
    @Input() userName: string;

    articles = [];
    loadedIds = [];
    formData: FormData;

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;

    async goback(){
        await this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
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
        ){
    }
    
    async ngOnInit(){
        this.reddah.getUserPhotos(this.userName, true);
        const loading = await this.loadingController.create({
            message: this.translateService.instant("Article.Loading"),
            spinner: 'circles',
        });
        await loading.present();
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getMaterial"+this.userName;
        //console.log(`cacheKey:${cacheKey}`);
        let request = this.reddah.getMaterial(this.formData);

        this.cacheService.loadFromObservable(cacheKey, request, "MaterialPage"+this.userName)
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
        this.cacheService.clearGroup("MaterialPage"+this.userName);
        this.articles = [];
        this.loadedIds = [];
        this.ngOnInit();
    }
  
    isFriend;
    nonFriendAllowTen;

    getMaterial(event):void {
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getMaterial" + this.userName + this.loadedIds.join(',');
        //console.log(`loadmore_cacheKey:${cacheKey}`);
        let request = this.reddah.getMaterial(this.formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "MaterialPage"+this.userName)
        .subscribe(timeline => 
        {
            for(let article of timeline){
                if(this.isFriend||
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
        this.getMaterial(event);
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
            this.renderer.setElementStyle(this.headerStart.nativeElement, 'visibility', 'visible');
            this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
            this.renderer.setElementStyle(this.headerStart.nativeElement, 'opacity', '8');
        }
        else if(offset<250 && offset>=150)
        {
            //console.log('start change'+offset)
            let opacity = (offset-150)/100;
            if(opacity<0) opacity=0;
            this.renderer.setElementStyle(this.headerStart.nativeElement, 'opacity', opacity+'');
            this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
        }
        else if(offset<150 && offset>=0){
            let opacity = (1-(offset-150)/100);
            if(opacity>1) opacity=1;
            this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'opacity', opacity+'');
        }
        else
        {
            this.renderer.setElementStyle(this.headerStart.nativeElement, 'visibility', 'hidden');
            this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'visibility', 'visible');
        }
    }

    async viewer(index, imageSrcArray) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
                index: index,
                imgSourceArray: imageSrcArray,
                imgTitle: "",
                imgDescription: ""
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true
        });
    
        return await modal.present();
    } 

    async goTsViewer(article){
        const userModal = await this.modalController.create({
            component: TsViewerPage,
            componentProps: { 
                article: article
            }
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
            componentProps: { postType: postType }
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
        });
          
        await modal.present();
    }

    isMe(){
        return this.userName==this.reddah.getCurrentUser();
    }
}
