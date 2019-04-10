import { Component, OnInit, Input } from '@angular/core';

import { PopoverController } from '@ionic/angular';

@Component({
  template: `
        <ion-item>
          <ion-icon (click)="close(1)" color="danger" name="heart-empty" size="medium" *ngIf="!liked"></ion-icon>
          <ion-text (click)="close(1)" margin-end *ngIf="!liked">赞</ion-text>
          <ion-icon (click)="close(2)" color="danger" name="heart-empty" size="medium" *ngIf="liked"></ion-icon>
          <ion-text (click)="close(2)" margin-end *ngIf="liked">取消</ion-text>
          <ion-icon (click)="close(3)" color="primary" name="chatboxes" size="medium"></ion-icon>
          <ion-text (click)="close(3)" margin-end>评论</ion-text>
        </ion-item>     
  `
})
export class TimelineCommentPopPage {
  @Input() liked: boolean;

  constructor(public popoverCtrl: PopoverController) {}

  close(opt: number){
      this.popoverCtrl.dismiss(opt);
  }
}
