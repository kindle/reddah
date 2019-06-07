import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
    template: `
      <div>
          <ion-item button (click)="close(0)">
              <ion-label>转发</ion-label>
          </ion-item>
          <ion-item button (click)="close(1)">
              <ion-label>删除</ion-label>
          </ion-item>
      </div>
    `
})
export class BookmarkPopPage {
    constructor(
        public popoverCtrl: PopoverController
    ) {}

    async close(value){
        this.popoverCtrl.dismiss(value);
    }
}
