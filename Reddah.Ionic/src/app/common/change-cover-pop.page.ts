import { Component } from '@angular/core';
import { ChangePhotoPage } from '../common/change-photo/change-photo.page';
import { PopoverController, ModalController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';

@Component({
  template: `
      <ion-item lines="none" button (click)="change()" color="light">
          <ion-label>{{ reddah.instant('Pop.ChangeCover') }}</ion-label>
      </ion-item>
  `
})
export class ChangeCoverPopPage {
  constructor(
      public popoverController: PopoverController,
      public modalController: ModalController,
      public reddah: ReddahService,
  ) {}

  async change(){
      //close popover menu
      this.popoverController.dismiss();

      const changePhotoModal = await this.modalController.create({
          component: ChangePhotoPage,
          componentProps: { 
              title : this.reddah.instant("Pop.ChangeCover"),
              tag : "cover",
              targetUserName: ""
          },
          cssClass: "modal-fullscreen",
      });
        
      await changePhotoModal.present();
      const { data } = await changePhotoModal.onDidDismiss();
      
      this.modalController.dismiss(data);
  }
}
