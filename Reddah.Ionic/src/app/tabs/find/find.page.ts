import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular'
import { ScanPage } from '../../common/scan/scan.page';
import { StatusBar } from '@ionic-native/status-bar';
import { SearchPage } from '../../common/search/search.page';
import { ShakePage } from '../../shake/shake.page';
import { ReddahService } from '../../reddah.service';

@Component({
  selector: 'app-find',
  templateUrl: 'find.page.html',
  styleUrls: ['find.page.scss']
})
export class FindPage {
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
    ){
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
        const modal = await this.modalController.create({
            component: ShakePage
        });
          
        await modal.present();
    }

}
