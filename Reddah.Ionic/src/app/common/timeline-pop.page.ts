import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  template: `
      <ion-item button (click)="select(1)">
          <ion-label>{{ 'Pop.TakePhoto' | translate }}</ion-label>
          <ion-text slot="end" style="font-size:14px;color:gray;padding-right:10px;">{{ 'Pop.Photo' | translate }}</ion-text>
      </ion-item>
      <ion-item button (click)="select(2)" lines="none">
          <ion-label>{{ 'Pop.SelectPhoto' | translate }}</ion-label>
      </ion-item>
      <ion-item button (click)="select(3)" lines="none">
          <ion-label>{{ 'Pop.SelectVideo' | translate }}</ion-label>
      </ion-item>
  `
})
export class TimelinePopPage {
    constructor(
        public popoverCtrl: PopoverController,
    ) {}

    select(type: number){
        this.popoverCtrl.dismiss(type);
    }

}
