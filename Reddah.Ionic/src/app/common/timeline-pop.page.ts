import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  template: `
      <ion-item button (click)="select(1)">
          <ion-label>拍摄</ion-label>
          <ion-text slot="end" style="font-size:14px;color:gray;padding-right:10px;">照片</ion-text>
      </ion-item>
      <ion-item button (click)="select(2)" lines="none">
          <ion-label>从相册选择照片</ion-label>
      </ion-item>
      <ion-item button (click)="select(3)" lines="none">
          <ion-label>从相册选择视频</ion-label>
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
