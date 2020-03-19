import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';

@Component({
    template: `
      <div>
          <ion-item button (click)="close(1)">
              <ion-label>{{ reddah.instant('Common.CopyChat') }}</ion-label>
          </ion-item>
      </div>
    `
})
export class ChatPopPage {
    constructor(
        public popoverCtrl: PopoverController,
        public reddah: ReddahService,
    ) {}

    async close(value){
        this.popoverCtrl.dismiss(value);
    }
}
