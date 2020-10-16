import { Component, Input } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { SettingNoteLabelPage } from '../settings/setting-note-label/setting-note-label.page';
import { ReddahService } from '../reddah.service';

@Component({
  template: `
      <ion-item button (click)="change()">
          <ion-label>{{ reddah.instant('Pop.Note') }}</ion-label>
      </ion-item>
  `
})
export class ChangeNoteNamePopPage {

    @Input() targetUserName;
    @Input() currentNoteName;

    constructor(
        public popoverController: PopoverController,
        public modalController: ModalController,
        public reddah: ReddahService,
    ) {}

    async change(){
        //close popover menu
        this.popoverController.dismiss();

        const modal = await this.modalController.create({
            component: SettingNoteLabelPage,
            componentProps: { 
                targetUserName: this.targetUserName,
                currentNoteName: this.currentNoteName
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
            
        await modal.present();
        const { data } = await modal.onDidDismiss();
        
        //this.modalController.dismiss(data);
    }
}
