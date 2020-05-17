import { Component, OnInit, NgZone } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { NavController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { AuthService } from '../../auth.service';
import { MyInfoPage } from '../../common/my-info/my-info.page';
import { SettingListPage } from '../../settings/setting-list/setting-list.page';
import { BookmarkPage } from '../../bookmark/bookmark.page';
import { TimelinePopPage } from '../../common/timeline-pop.page';
import { AddTimelinePage } from '../../mytimeline/add-timeline/add-timeline.page';
import { PointPage } from '../../common/point/point.page';
import { MyReportPage } from '../../mytimeline/myreport/myreport.page';
import { PunchClockPage } from '../../common/point/punch-clock/punch-clock.page';
import { PublisherPage } from '../publisher/publisher.page';
import { SearchPage } from 'src/app/common/search/search.page';
import { UserPage } from 'src/app/common/user/user.page';

@Component({
    selector: 'app-about',
    templateUrl: 'about.page.html',
    styleUrls: ['about.page.scss']
})
export class AboutPage implements OnInit {
    
    //checked = false;
    userName: string;
    nickName: string;

    constructor(
        private localStorageService: LocalStorageService,
        public modalController: ModalController,
        private popoverController: PopoverController,
        public navController: NavController,
        public reddah: ReddahService,
        public authService: AuthService,
    ) {
        this.userName = "Not Set";
        this.userName = this.localStorageService.retrieve("Reddah_CurrentUser");
    }
    
    ngOnInit() {
        if(!this.reddah.isPointDone(this.reddah.pointTasks[0])){
            this.reddah.getPointLogin().subscribe(data=>{
                if(data.Success==0||data.Success==3){ 
                    this.localStorageService.store(`Reddah_Login_PointToday_${this.reddah.getTodayString()}_${this.reddah.getCurrentUser()}`, data.Message.GotPoint);
                    if(data.Success==0){
                        this.reddah.toast(
                            this.reddah.instant("Point.TaskLoginTitle")+
                            " +"+this.reddah.lan2(data.Message.GotPoint,
                            this.reddah.instant("Point.Fen")),
                        "primary");
                        this.reddah.getUserPhotos(this.userName);
                    }
                }
            });
        }
        
        this.reddah.getUserPhotos(this.userName);
    }

    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
        });
          
        await userModal.present();
    }


    async goSettings(){
        let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
        const modal = await this.modalController.create({
            component: SettingListPage,
            componentProps: {currentLocale:currentLocale},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.authService.logout();
        }
    }
    
    async myInfo() {
        const myInfoModal = await this.modalController.create({
            component: MyInfoPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await myInfoModal.present();
        const { data } = await myInfoModal.onDidDismiss();
        //check if change
        if(data)
            this.reddah.getUserPhotos(this.userName);
        
    }

    async goBookmark(){
        const modal = await this.modalController.create({
            component: BookmarkPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
    }

    async goSearch(type){
        const modal = await this.modalController.create({
            component: SearchPage,
            componentProps: {
                type: type
            },
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
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
            
        }
    }

    async goCredit(event){
        event.stopPropagation();

        this.reddah.reloadLocaleSettings();

        const modal = await this.modalController.create({
            component: PointPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
    
        await modal.present();
    }

    async goMyReport() {
        const modal = await this.modalController.create({
            component: MyReportPage,
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
            this.reddah.getUserPhotos(this.reddah.getCurrentUser());
        }
    }


    async goPublicPage(){
        const modal = await this.modalController.create({
            component: PublisherPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }

    /*
    async goMiniPage(){
        const userModal = await this.modalController.create({
            component: SearchPage,
            componentProps: {
                type: 3,//mini only
            },
            cssClass: "modal-fullscreen",
        });
          
        await userModal.present();
    }
    */
}
