import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular'
import { ScanPage } from '../../common/scan/scan.page';
import { PublisherPage } from '../publisher/publisher.page';
import { SearchPage } from '../../common/search/search.page';
import { ShakePage } from '../../shake/shake.page';
import { ReddahService } from '../../reddah.service';
import { LocationPage } from '../../common/location/location.page';
import { MagicMirrorPage } from '../../common/magic-mirror/magic-mirror.page';
import { BlackHolePage } from '../../common/black-hole/black-hole.page';

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
    ){
        this.userName =  this.reddah.getCurrentUser();
    }

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
            component: BlackHolePage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }

}
