import { Component } from '@angular/core';
import { ReddahService } from '../reddah.service';
import { MapPage } from '../map/map.page';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(
    public reddah: ReddahService,
    private modalController: ModalController,
    private router: Router,
    ) {
        this.reddah.getUserPhotos(this.reddah.getCurrentUser());
    }

    async openEarth(){
      
        const modal = await this.modalController.create({
            component: MapPage,
            componentProps: {
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
    }

}
