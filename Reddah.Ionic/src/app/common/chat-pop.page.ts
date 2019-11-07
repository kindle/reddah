import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
    template: `
      <div>
          <ion-item button (click)="close(1)">
              <ion-label>{{ 'Common.CopyChat' | translate }}</ion-label>
          </ion-item>
      </div>
    `
})
export class ChatPopPage {
    constructor(
        public popoverCtrl: PopoverController
    ) {}

    async close(value){
        this.popoverCtrl.dismiss(value);
    }
}
