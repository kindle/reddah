import { Component, Input } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { SettingNoteLabelPage } from '../settings/setting-note-label/setting-note-label.page';

@Component({
  template: `
      <ion-item button (click)="change()">
          <ion-label>设置备注和标签</ion-label>
      </ion-item>
  `
})
export class ChangeNoteNamePopPage {

    @Input() targetUserName;
    @Input() currentNoteName;

    constructor(
        public popoverController: PopoverController,
        public modalController: ModalController,
    ) {}

    async change(){
        //close popover menu
        this.popoverController.dismiss();

        const modal = await this.modalController.create({
            component: SettingNoteLabelPage,
            componentProps: { 
                targetUserName: this.targetUserName,
                currentNoteName: this.currentNoteName
            }
        });
            
        await modal.present();
        const { data } = await modal.onDidDismiss();
        
        //this.modalController.dismiss(data);
    }
}
