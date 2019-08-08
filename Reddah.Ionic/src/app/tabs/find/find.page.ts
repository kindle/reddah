import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular'
import { ScanPage } from '../../common/scan/scan.page';
import { StatusBar } from '@ionic-native/status-bar';
import { SearchPage } from '../../common/search/search.page';
import { ShakePage } from '../../shake/shake.page';
import { ReddahService } from '../../reddah.service';
import { LocationPage } from '../../common/location/location.page';

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
            componentProps: { }
        });
        
        await scanModal.present();
        const { data } = await scanModal.onDidDismiss();
        if(data){
            console.log(data)
        }

    };

    async goSearch(){
        const userModal = await this.modalController.create({
            component: SearchPage
        });
          
        await userModal.present();
    }

    async shake(){
        let myLocation = this.reddah.appData("userlocationjson_"+this.userName);
        if(myLocation&&myLocation.location){
            const modal = await this.modalController.create({
                component: ShakePage
            });
              
            await modal.present();
        }
        else{
            this.changeLocation();
        }
    }

    async changeLocation(){
        const modal = await this.modalController.create({
            component: LocationPage
        });
    
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.reddah.saveUserLocation(this.userName, data, data.location.lat, data.location.lng);
        }
    }

}
