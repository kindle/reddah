import { Component } from '@angular/core';
import { ChangePhotoPage } from '../common/change-photo/change-photo.page';
import { PopoverController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  template: `
      <ion-item lines="none" button (click)="change()">
          <ion-label>{{ 'Pop.ChangeCover' | translate }}</ion-label>
      </ion-item>
  `
})
export class ChangeCoverPopPage {
  constructor(
      public popoverController: PopoverController,
      public modalController: ModalController,
      public translateService: TranslateService,
  ) {}

  async change(){
      //close popover menu
      this.popoverController.dismiss();

      const changePhotoModal = await this.modalController.create({
          component: ChangePhotoPage,
          componentProps: { 
            title : this.translateService.instant("Pop.ChangeCover"),
            tag : "cover",
            targetUserName: ""
          }
      });
        
      await changePhotoModal.present();
      const { data } = await changePhotoModal.onDidDismiss();
      
      this.modalController.dismiss(data);
  }
}
