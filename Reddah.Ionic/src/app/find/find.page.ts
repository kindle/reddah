import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular'
import { ScanPage } from '../scan/scan.page';

@Component({
  selector: 'app-find',
  templateUrl: 'find.page.html',
  styleUrls: ['find.page.scss']
})
export class FindPage {
    constructor(
      private modalController: ModalController,
    ){}

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

}
