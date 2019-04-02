import { Component, OnInit } from '@angular/core';

import { PopoverController } from '@ionic/angular';

@Component({
  template: `
      <ion-item button (click)="foo()" lines="none">
          <ion-icon name="heart-empty"></ion-icon>
          <ion-label>赞</ion-label>
          <ion-icon name="chatboxes"></ion-icon>
          <ion-label>评论</ion-label>
      </ion-item>
  `
})
export class TimelineCommentPopPage {
  constructor(public popoverCtrl: PopoverController) {}

  support() {
    // this.app.getRootNavs()[0].push('/support');
    this.popoverCtrl.dismiss();
  }

  close() {
    this.popoverCtrl.dismiss();
  }

  foo(){

  }
}
