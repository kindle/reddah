import { Component } from '@angular/core';
import { ReddahService } from '../reddah.service';
import { MapPage } from '../map/map.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(
    public reddah: ReddahService,
    private modalController: ModalController,
    ) {}

    async openEarth(){
      
        const modal = await this.modalController.create({
            component: MapPage,
            componentProps: {
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

}
