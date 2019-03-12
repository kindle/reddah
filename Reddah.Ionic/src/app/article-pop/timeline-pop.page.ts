import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  template: `
    <ion-list>
      <ion-item button (click)="select(1)">
          <ion-label>拍摄</ion-label>
      </ion-item>
      <ion-item button (click)="select(2)">
          <ion-label>从相册选择</ion-label>
      </ion-item>
    </ion-list>
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
