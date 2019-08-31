import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
    template: `
      <ion-list>
        <ion-item button (click)="foo()">
            <ion-icon slot="start" color="warning" name="alert"></ion-icon>  
            <ion-label>{{ 'Pop.Report' | translate }}</ion-label>
        </ion-item>
        <ion-item button (click)="foo()">
            <ion-icon slot="start" color="dark" name="trash"></ion-icon>  
            <ion-label>{{ 'Comment.Delete' | translate }}</ion-label>
        </ion-item>
        <ion-item button (click)="close()">
            <ion-icon slot="start" color="danger" name="close"></ion-icon>
            <ion-label>{{ 'Button.Close' | translate }}</ion-label>
        </ion-item>
      </ion-list>
    `
})
export class CommentPopPage {
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
