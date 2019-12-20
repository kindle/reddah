import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import { HistoryPage } from './history/history.page';
import { PunchClockPage } from './punch-clock/punch-clock.page';
import { LocalStorageService } from 'ngx-webstorage';
import { Router, ActivatedRoute } from '@angular/router';
import { LocationPage } from '../location/location.page';
import { ShakePage } from '../../shake/shake.page';
import { MapPage } from '../../map/map.page';
import { ChangePhotoPage } from '../change-photo/change-photo.page';
import { SettingSignaturePage } from '../../settings/setting-signature/setting-signature.page';
import { TimelinePopPage } from '../timeline-pop.page';
import { AddTimelinePage } from '../../mytimeline/add-timeline/add-timeline.page';
import { SettingAccountPage } from '../../settings/setting-account/setting-account.page';

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
        private localStorageService: LocalStorageService,
        private router: Router,
    ){
        this.userName = this.reddah.getCurrentUser();
    }


    async ngOnInit(){
        this.reddah.getUserPhotos(this.userName);
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
        const { data } = await modal.onDidDismiss();
        if(data){
            this.ngOnInit();
        }
    }

    async doTask(task){
        if(task.id>=2&&task.id<=5){//article related
            this.close();
            this.router.navigateByUrl('tabs/(home:home)');
        }
        else if(task.id==6){//photo
            this.changePhoto();
        }
        else if(task.id==7){//signature
            this.changeSignature();
        }
        else if(task.id==8){//timeline
            this.post(null);
        }
        else if(task.id==9){//mini
            this.close();
            this.router.navigateByUrl('search?type=3');
        }
        else if(task.id==10){//friend
            this.openMap();
        }
        else if(task.id==11){//shake
            this.shake();
        }
        else if(task.id==12){//email
            this.email();
        }
        else{
            this.close();
        }
    }

    async changePhoto(){
        const userModal = await this.modalController.create({
          component: ChangePhotoPage,
          componentProps: { 
              title: this.translate.instant("About.Photo"),
              tag : "portrait",
              targetUserName: ""
          },
          cssClass: "modal-fullscreen",
        });
          
        await userModal.present();
        const { data } = await userModal.onDidDismiss();
        if(data)
        {
            this.reddah.getUserPhotos(this.userName);
        }
    }

    async changeSignature(){
        const modal = await this.modalController.create({
            component: SettingSignaturePage,
            componentProps: {
                title: this.translate.instant("About.Signature"),
                currentSignature: this.reddah.appData('usersignature_'+this.userName)
            },
            cssClass: "modal-fullscreen",
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data)
            this.reddah.getUserPhotos(this.userName);
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
        });
          
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            this.reddah.getUserPhotos(this.userName);
        }
    }
    
    async shake(){
        let myLocationstr = this.reddah.appData("userlocationjson_"+this.userName);
        let myLocation = null;
        try{
            myLocation = JSON.parse(myLocationstr);
        }catch(e){}
        if(myLocation&&myLocation.location){
            const modal = await this.modalController.create({
                component: ShakePage,
                componentProps: {},
                cssClass: "modal-fullscreen",
            });
              
            await modal.present();
            const { data } = await modal.onDidDismiss();
            if(data||!data){
                this.reddah.getUserPhotos(this.userName);
            }
        }
        else{
            this.changeLocation();
        }
    }

    async changeLocation(){
        const modal = await this.modalController.create({
            component: LocationPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
    
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.reddah.saveUserLocation(this.userName, data, data.location.lat, data.location.lng);
        }
    }

    async email(){
        const modal = await this.modalController.create({
            component: SettingAccountPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.reddah.getUserPhotos(this.userName);
        }
    }

    async openMap(){
        const modal = await this.modalController.create({
            component: MapPage,
            componentProps: {
                //lat: this.config.lat,
                //lng: this.config.lng
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data||!data){
            this.reddah.getUserPhotos(this.userName);
        }
    }

    display=false;
    showRule(){
        this.display = !this.display;
    }
    
}
