import { Component, Inject, Renderer2, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { ReddahService } from '../reddah.service';
import { ModalController } from '@ionic/angular';
import { ShakePage } from '../shake/shake.page';
import { LocationPage } from '../common/location/location.page';
import { WormHolePage } from '../common/worm-hole/worm-hole.page';
import { MysticPage } from '../common/mystic/mystic.page';
import { ActiveUsersPage } from '../activeusers/activeusers.page';
declare var $:any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{

    userName;

    constructor(
      private _renderer2: Renderer2,
      @Inject(DOCUMENT) private _document: Document,
      private router: Router,
      public reddah: ReddahService,
      private modalController: ModalController,
    ) {}

    ngOnInit(){
      this.userName = this.reddah.getCurrentUser();
      this.addScriptByUrl("/assets/balloons/index.js");
    }
  
  
    ionViewDidEnter(){
      let player = this._document.body.getElementsByTagName("video")[0];
      if(player){

        player.muted = true;
        player.play();
      }
    }
  
    ionViewWillLeave(){
        let player = this._document.body.getElementsByTagName("video")[0];
        if(player){
          player.pause();
          player.currentTime = 0;
        }
    }

    goPublicRich(){
      this.router.navigate(['/tabs/home']);
    }

    goPublicShort(){
      this.router.navigate(['/tabs/find']);
    }

    goPrivate(){
      this.router.navigate(['/mytimeline']);
    }

    async goChat(){
      const modal = await this.modalController.create({
          component: MysticPage,
          componentProps: {},
          cssClass: "modal-fullscreen",
      });
      await modal.present();
    }

    async goShake(){
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

    async goCollapsar(){
      const modal = await this.modalController.create({
          component: WormHolePage,
          componentProps: {},
          cssClass: "modal-fullscreen",
      });
      await modal.present();
    }

    async goActiveUsers(){
      const modal = await this.modalController.create({
          component: ActiveUsersPage,
          componentProps: {},
          cssClass: "modal-fullscreen",
      });
      await modal.present();
    }
  
    addScriptByUrl(src){
      let key = this.reddah.nonce_str()+"_js";
  
      let s = this._renderer2.createElement('script');
      s.type = "text/javascript";
      s.src = src;
      s.id = key;
      
      this._renderer2.appendChild(
          this._document.body.getElementsByTagName("app-tab1")[0], s);
      
    }

    @ViewChild('viewporttext')
    viewPortText:ElementRef;

    async onScroll($event){
      let opacity = (document.body.offsetHeight - $event.detail.scrollTop) / document.body.offsetHeight;
      let scale = (document.body.offsetHeight - $event.detail.scrollTop) / document.body.offsetHeight;
      
      this.viewPortText.nativeElement.style.setProperty('opacity', opacity+"");
      this.viewPortText.nativeElement.style.setProperty('transform', 'scale('+scale+')');
  }
}