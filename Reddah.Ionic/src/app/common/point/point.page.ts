import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import { HistoryPage } from './history/history.page';
import { PunchClockPage } from './punch-clock/punch-clock.page';

@Component({
    selector: 'app-point',
    templateUrl: 'point.page.html',
    styleUrls: ['point.page.scss']
})
export class PointPage implements OnInit {

    points = [];
    loadedIds = [];

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    @ViewChild('pageTop') pageTop: Content;
    
    userName: any;

    async close(){
        this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        private popoverController: PopoverController,
        public modalController: ModalController,
        private translate: TranslateService,
        private cacheService: CacheService,

    ){
        this.userName = this.reddah.getCurrentUser();
    }

    async ngOnInit(){
        
    }
     

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("PointPage");
        
    }

    //drag down
    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    //drag up
    loadData(event) {
        
    }

    async pointDetails(){
        const modal = await this.modalController.create({
            component: HistoryPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
    
        await modal.present();
    }

    async punchClock(){
        const modal = await this.modalController.create({
            component: PunchClockPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
    
        await modal.present();
    }

    tasks=[
        {
            id:1, 
            title: this.translate.instant("Point.TaskLoginTitle"),
            description: this.translate.instant("Point.TaskLoginDescp"),
            point: 1, 
            got: 1,
            max: 1,
            type: 0, //0:daily 1:once
        },
        {
            id:2, 
            title: this.translate.instant("Point.TaskReadTitle"),
            description: this.translate.instant("Point.TaskReadDescp"),
            point: 1, 
            got: 1,
            max: 6,
            type: 0,
        },
        {
            id:3, 
            title: this.translate.instant("Point.TaskMarkTitle"),
            description: this.translate.instant("Point.TaskMarkDescp"),
            point: 1, 
            got: 1,
            max: 2,
            type: 0,
        },
        {
            id:4, 
            title: this.translate.instant("Point.TaskShareTitle"),
            description: this.translate.instant("Point.TaskShareDescp"),
            point: 1, 
            got: 1,
            max: 2,
            type: 0,
        },
        {
            id:5, 
            title: this.translate.instant("Point.TaskCommentTitle"),
            description: this.translate.instant("Point.TaskCommentDescp"),
            point: 1, 
            got: 1,
            max: 3,
            type: 0,
        },
        {
            id:6, 
            title: this.translate.instant("Point.TaskFirstPhotoTitle"),
            description: this.translate.instant("Point.TaskFirstPhotoDescp"),
            point: 10, 
            got: 0,
            max: 10,
            type: 1,
        },
        {
            id:7, 
            title: this.translate.instant("Point.TaskFirstSignatureTitle"),
            description: this.translate.instant("Point.TaskFirstSignatureDescp"),
            point: 10, 
            got: 10,
            max: 10,
            type: 1,
        },
        {
            id:8, 
            title: this.translate.instant("Point.TaskFirstTimelineTitle"),
            description: this.translate.instant("Point.TaskFirstTimelineDescp"),
            point: 10, 
            got: 0,
            max: 10,
            type: 1,
        },
        {
            id:9, 
            title: this.translate.instant("Point.TaskFirstGameTitle"),
            description: this.translate.instant("Point.TaskFirstGameDescp"),
            point: 5, 
            got: 0,
            max: 5,
            type: 1,
        },
        {
            id:10, 
            title: this.translate.instant("Point.TaskFirstFriendTitle"),
            description: this.translate.instant("Point.TaskFirstFriendDescp"),
            point: 10, 
            got: 0,
            max: 10,
            type: 1,
        },
        {
            id:11, 
            title: this.translate.instant("Point.TaskFirstShakeTitle"),
            description: this.translate.instant("Point.TaskFirstShakeDescp"),
            point: 10, 
            got: 0,
            max: 10,
            type: 1,
        },
    ];
    
}
