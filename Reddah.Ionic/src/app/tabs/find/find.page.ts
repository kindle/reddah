import { Component, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular'
import { ScanPage } from '../../common/scan/scan.page';
import { SearchPage } from '../../common/search/search.page';
import { ShakePage } from '../../shake/shake.page';
import { ReddahService } from '../../reddah.service';
import { LocationPage } from '../../common/location/location.page';
import { MagicMirrorPage } from '../../common/magic-mirror/magic-mirror.page';
import { BlackHolePage } from '../../common/black-hole/black-hole.page';
import { WormHolePage } from '../../common/worm-hole/worm-hole.page';
import { LocalStorageService } from 'ngx-webstorage';
import {  ActivatedRoute, Params } from '@angular/router';
import { MysticPage } from '../../common/mystic/mystic.page';
import { StoryPage } from '../../story/story.page';
import { MapPage } from '../../map/map.page';
import { PlatformPage } from '../publisher/platform/platform.page';
import { EarthBoxComponent } from '../../common/earth-box/earth-box.component';

@Component({
  selector: 'app-find',
  templateUrl: 'find.page.html',
  styleUrls: ['find.page.scss']
})
export class FindPage {

    userName;

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private activeRoute: ActivatedRoute
    ){}

    async startScanner(){
        const scanModal = await this.modalController.create({
            component: ScanPage,
            componentProps: { },
            cssClass: "modal-fullscreen",
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
        });
          
        await userModal.present();
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


    async magicMirror(){
        const modal = await this.modalController.create({
            component: MagicMirrorPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }

    async blackHole(){
        const modal = await this.modalController.create({
            component: WormHolePage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }

    async mystic(){
        const modal = await this.modalController.create({
            component: MysticPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
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
        });
          
        await modal.present();
    }


    async goPlatform(){
        const modal = await this.modalController.create({
            component: PlatformPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
    }


    @ViewChild('earthbox') earthbox;
    showBox= false;
    async showEarthBox(){
        this.showBox = true;
    }
}
