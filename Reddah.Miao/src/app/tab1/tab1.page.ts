import { Component, ViewChild, OnInit } from '@angular/core';
import { ModalController, AlertController, ActionSheetController, PopoverController } from '@ionic/angular'
import { ScanPage } from '../common/scan/scan.page';
import { SearchPage } from '../common/search/search.page';
import { ShakePage } from '../shake/shake.page';
import { ReddahService } from '../reddah.service';
import { LocationPage } from '../common/location/location.page';
import { MagicMirrorPage } from '../common/magic-mirror/magic-mirror.page';
import { WormHolePage } from '../common/worm-hole/worm-hole.page';
import {  Router } from '@angular/router';
import { MysticPage } from '../common/mystic/mystic.page';
import { StoryPage } from '../story/story.page';
import { MapPage } from '../map/map.page';
import { ShareChooseChatPage } from '../chat/share-choose-chat/share-choose-chat.page';
import { AddFeedbackPage } from '../mytimeline/add-feedback/add-feedback.page';
import { MiniViewerComponent } from '../common/mini-viewer/mini-viewer.component';
import { LocalStorageService } from 'ngx-webstorage';
import { CacheService } from 'ionic-cache';
import { ArticleTextPopPage } from 'src/app/common/article-text-pop.page';
import { ImageViewerComponent } from 'src/app/common/image-viewer/image-viewer.component';
import { UserPage } from 'src/app/common/user/user.page';
import { AddTimelinePage } from 'src/app/mytimeline/add-timeline/add-timeline.page';
import { TimelinePopPage } from 'src/app/common/timeline-pop.page';
import { ActiveUsersPage } from 'src/app/activeusers/activeusers.page';
import { PublisherPage } from '../tabs/publisher/publisher.page';
import { VideosPage } from '../videos/videos.page';
import { GameCubePage } from '../games/cube/cube.page';
import { GameRememberPage } from '../games/remember/remember.page';
import { GameConnectPage } from '../games/connect/connect.page';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  userName;
  user_apps=[];

  constructor(
      private modalController: ModalController,
      public reddah: ReddahService,
  ){
  }

  async miao(){
    const userModal = await this.modalController.create({
        component: SearchPage,
        componentProps: {},
        cssClass: "modal-fullscreen",
        swipeToClose: true,
        presentingElement: await this.modalController.getTop(),
    });
      
    await userModal.present();
  }


  ngOnInit(){
      this.userName = this.reddah.getCurrentUser();
  }

  async gameCube(){
        const scanModal = await this.modalController.create({
            component: GameCubePage,
            componentProps: { },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await scanModal.present();
  }

  async gameRemember(){
    const scanModal = await this.modalController.create({
        component: GameRememberPage,
        componentProps: { },
        cssClass: "modal-fullscreen",
        swipeToClose: true,
        presentingElement: await this.modalController.getTop(),
    });
    
    await scanModal.present();
  }   
  
  async gameConnect(){
    const scanModal = await this.modalController.create({
        component: GameConnectPage,
        componentProps: { },
        cssClass: "modal-fullscreen",
        swipeToClose: true,
        presentingElement: await this.modalController.getTop(),
    });
    
    await scanModal.present();
  }   

  async startScanner(){
      const scanModal = await this.modalController.create({
          component: ScanPage,
          componentProps: { },
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
      
      await scanModal.present();
      const { data } = await scanModal.onDidDismiss();
      if(data){
          //console.log(data)
      }

  };

  async goSearch(){
      const userModal = await this.modalController.create({
          component: SearchPage,
          componentProps: {},
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
        
      await userModal.present();
  }

  async goSearchN(type){
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
              swipeToClose: true,
              presentingElement: await this.modalController.getTop(),
          });
            
          await modal.present();
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
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
  
      await modal.present();
      const { data } = await modal.onDidDismiss();
      if(data){
          this.reddah.saveUserLocation(this.userName, data, data.location.lat, data.location.lng);
      }
  }


  async magicMirror(){
      const modal = await this.modalController.create({
          component: MagicMirrorPage,
          componentProps: {},
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
      await modal.present();
  }

  async magicMirrorCat(){
      const modal = await this.modalController.create({
          component: MagicMirrorPage,
          componentProps: {},
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
      await modal.present();
  }

  async blackHole(){
      const modal = await this.modalController.create({
          component: WormHolePage,
          componentProps: {},
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
      await modal.present();
  }

  async mystic(){
      const modal = await this.modalController.create({
          component: MysticPage,
          componentProps: {},
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
      await modal.present();
  }

  async newUsers(){
      const modal = await this.modalController.create({
          component: ActiveUsersPage,
          componentProps: {},
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
      await modal.present();
  }

  async story(){
      const modal = await this.modalController.create({
          component: StoryPage,
          componentProps: {
              //lat: this.config.lat,
              //lng: this.config.lng
          },
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
          
      await modal.present();
  }

  async video(){
    const modal = await this.modalController.create({
        component: VideosPage,
        componentProps: {
            
        },
        cssClass: "modal-fullscreen",
        swipeToClose: true,
        presentingElement: await this.modalController.getTop(),
    });
        
    await modal.present();
}

  async map(){
      const modal = await this.modalController.create({
          component: MapPage,
          componentProps: {
              //lat: this.config.lat,
              //lng: this.config.lng
          },
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
        
      await modal.present();
  }


  async goMoreApp(){
      const modal = await this.modalController.create({
            component: SearchPage,
            componentProps: { 
                type: 3,
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await modal.present();
  }

  async goMini(mini){
      
      //open mini page
      const modal = await this.modalController.create({
          component: MiniViewerComponent,
          componentProps: { 
              mini: mini,
              content: mini.Cover,
              guid: mini.UserName,
              //version: mini.Sex,//always use the latest version
              version: this.reddah.appData('usersex_'+mini.UserName)
          },
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
        
      await modal.present();
      const { data } = await modal.onDidDismiss();
      if(data||!data)
      {
          if(data=='report'){
              const modal = await this.modalController.create({
                  component: AddFeedbackPage,
                  componentProps: { 
                      title: this.reddah.instant("Pop.Report"),
                      desc: this.reddah.instant("Pop.ReportReason"),
                      feedbackType: 4,
                      article: mini
                  },
                  cssClass: "modal-fullscreen",
                  swipeToClose: true,
                  presentingElement: await this.modalController.getTop(),
              });
                
              await modal.present();
          }
          else if(data=='share'){
              const modal = await this.modalController.create({
                  component: ShareChooseChatPage,
                  componentProps: { 
                      title: this.reddah.instant("Common.Choose"),
                      article: mini,
                  },
                  cssClass: "modal-fullscreen",
                  swipeToClose: true,
                  presentingElement: await this.modalController.getTop(),
              });
                
              await modal.present();        
          }
      }

      this.reddah.setRecent(mini,4);
      this.reddah.setRecentUseMini(mini.UserName).subscribe(data=>{
          this.user_apps = this.reddah.loadRecent(4);
      });
  }


    async goPublicPage(){
        const modal = await this.modalController.create({
            component: PublisherPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        await modal.present();
    }

}
