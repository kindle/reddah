import { Component } from '@angular/core';
import { ChangePhotoPage } from '../common/change-photo/change-photo.page';
import { PopoverController, ModalController } from '@ionic/angular';

@Component({
  template: `
      <ion-item button (click)="change()">
          <ion-label>更换相册封面</ion-label>
      </ion-item>
  `
})
export class ChangeCoverPopPage {
  constructor(
      public popoverController: PopoverController,
      public modalController: ModalController,
  ) {}

  async change(){
      //close popover menu
      this.popoverController.dismiss();

      const changePhotoModal = await this.modalController.create({
          component: ChangePhotoPage,
          componentProps: { 
            title : "更换相册封面",
            tag : "cover"
          }
      });
        
      await changePhotoModal.present();
      const { data } = await changePhotoModal.onDidDismiss();
      
      this.modalController.dismiss(data);
  }
}