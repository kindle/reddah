import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StartComponent } from '../start/start.component';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(
    private modalController: ModalController,
  ) {
    //this.goStart();
  }

  async goStart(){
    const modal = await this.modalController.create({
        component: StartComponent,
        componentProps: { 
            
        },
        cssClass: "modal-fullscreen",
        swipeToClose: true,
        presentingElement: await this.modalController.getTop(),
    });
      
    await modal.present();
  }

}
