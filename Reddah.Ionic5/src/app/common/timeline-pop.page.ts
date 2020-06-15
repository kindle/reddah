import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';

@Component({
  template: `
      <ion-item button (click)="select(1)" color="light">
          <ion-label>{{ reddah.instant('Pop.TakePhoto') }}</ion-label>
          <ion-text slot="end" style="font-size:14px;color:gray;padding-right:10px;">{{ reddah.instant('Pop.Photo') }}</ion-text>
      </ion-item>
      <ion-item button (click)="select(2)" lines="none" color="light">
          <ion-label>{{ reddah.instant('Pop.SelectPhoto') }}</ion-label>
      </ion-item>
      <!--
      <ion-item button (click)="select(3)" lines="none" color="light">
          <ion-label>{{ reddah.instant('Pop.SelectVideo') }}</ion-label>
      </ion-item>-->
  `
})
export class TimelinePopPage {
    constructor(
        public popoverCtrl: PopoverController,
        public reddah: ReddahService,
    ) {}

    select(type: number){
        this.popoverCtrl.dismiss(type);
    }

}
