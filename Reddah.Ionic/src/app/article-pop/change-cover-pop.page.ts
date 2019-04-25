import { Component } from '@angular/core';

import { PopoverController } from '@ionic/angular';

@Component({
  template: `
      <ion-item button (click)="change()" text-center>
          <ion-label>更换相册封面</ion-label>
      </ion-item>
  `
})
export class ChangeCoverPopPage {
  constructor(public popoverCtrl: PopoverController) {}

  change(){
      alert('change cover');
  }
}
