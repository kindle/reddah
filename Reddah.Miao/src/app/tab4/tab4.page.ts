import { Component, OnInit, NgZone, Input } from '@angular/core';
import { ModalController, PopoverController, AlertController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { NavController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { AuthService } from '../auth.service';
import { MyInfoPage } from '../common/my-info/my-info.page';
import { BookmarkPage } from '../bookmark/bookmark.page';
import { TimelinePopPage } from '../common/timeline-pop.page';
import { AddTimelinePage } from '../mytimeline/add-timeline/add-timeline.page';
import { PointPage } from '../common/point/point.page';
import { MyReportPage } from '../mytimeline/myreport/myreport.page';
import { PunchClockPage } from '../common/point/punch-clock/punch-clock.page';
import { SearchPage } from 'src/app/common/search/search.page';
import { UserPage } from 'src/app/common/user/user.page';
import { PlatformPage } from '../tabs/publisher/platform/platform.page';
import { AddFeedbackPage } from '../mytimeline/add-feedback/add-feedback.page';
import { SettingAboutPage } from '../settings/setting-about/setting-about.page';
import { SettingGePage } from '../settings/setting-ge/setting-ge.page';
import { SettingPrivacyPage } from '../settings/setting-privacy/setting-privacy.page';
import { SettingNetworkPage } from '../settings/setting-network/setting-network.page';
import { SettingAccountPage } from '../settings/setting-account/setting-account.page';
import { MyTimeLinePage } from '../mytimeline/mytimeline.page';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page implements OnInit {
    
  //checked = false;
  userName: string;
  nickName: string;
  currentLocale: string;

  constructor(
      private localStorageService: LocalStorageService,
      public modalController: ModalController,
      private popoverController: PopoverController,
      public navController: NavController,
      private alertController: AlertController,
      public reddah: ReddahService,
      public authService: AuthService,
  ) {
      //this.userName = "Not Set";
      this.userName = this.reddah.getCurrentUser();
      this.currentLocale = this.reddah.getCurrentLocale();
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
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
        
      await userModal.present();
  }

  
  async myInfo() {
      const myInfoModal = await this.modalController.create({
          component: MyInfoPage,
          componentProps: {},
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
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
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
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
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
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
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
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
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
  
      await modal.present();
  }

  async goMyReport() {
      const modal = await this.modalController.create({
          component: MyReportPage,
          componentProps: {},
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
        
      await modal.present();
  }
  
  async punchClock(){
      const modal = await this.modalController.create({
          component: PunchClockPage,
          componentProps: {},
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
  
      await modal.present();
      const { data } = await modal.onDidDismiss();
      if(data){
          this.reddah.getUserPhotos(this.reddah.getCurrentUser());
      }
  }


    async goPlatform(){
        const modal = await this.modalController.create({
            component: PlatformPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
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
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
      });
        
      await userModal.present();
  }
  */


 async logout() {
        const alert = await this.alertController.create({
            header: this.reddah.instant("Confirm.Title"),
            message: this.reddah.instant("Confirm.LogoutMessage"),
            buttons: [
            {
                text: this.reddah.instant("Confirm.Cancel"),
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {}
            }, 
            {
                text: this.reddah.instant("Confirm.Yes"),
                handler: () => {
                    this.reddah.logout();
                }
            }]
        });

        await alert.present().then(()=>{});
    }


    async goAccount(){
        const modal = await this.modalController.create({
            component: SettingAccountPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await modal.present();
    }

    async goNetwork(){
        const modal = await this.modalController.create({
            component: SettingNetworkPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await modal.present();
    }

    async goPrivacy(){
        const modal = await this.modalController.create({
            component: SettingPrivacyPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await modal.present();
    }

    async goGeneral(){
        const modal = await this.modalController.create({
            component: SettingGePage,
            componentProps: {currentLocale:this.currentLocale},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.modalController.dismiss(data);
        }
    }


    async goAbout(){
        const modal = await this.modalController.create({
            component: SettingAboutPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await modal.present();
    }


    async goFeedback(){
        const modal = await this.modalController.create({
            component: AddFeedbackPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await modal.present();
    }

    async goMyTimeline(){
        const modal = await this.modalController.create({
            component: MyTimeLinePage,
            componentProps: {
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await modal.present();
    }
}
