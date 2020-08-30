import { Component } from '@angular/core';
import { ReddahService } from '../reddah.service';
import { MapPage } from '../map/map.page';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MapHWPage } from '../maphw/maphw.page';

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
      
        let isHwMapLoaded = (window["reddahMapHw"].loaded ===true);
        const modal = await this.modalController.create(
            {
              component: isHwMapLoaded?MapHWPage:MapPage,
              componentProps: {
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
    }

}
