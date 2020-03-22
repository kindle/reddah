import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';

@Component({
    template: `
      <ion-list>
        <ion-item button (click)="foo()">
            <ion-icon slot="start" color="dark" name="warning-outline"></ion-icon>  
            <ion-label>{{ reddah.instant('Pop.Report') }}</ion-label>
        </ion-item>
        <ion-item button (click)="foo()">
            <ion-icon slot="start" color="dark" name="trash"></ion-icon>  
            <ion-label>{{ reddah.instant('Comment.Delete') }}</ion-label>
        </ion-item>
        <ion-item button (click)="close()">
            <ion-icon slot="start" color="danger" name="close-outline"></ion-icon>
            <ion-label>{{ reddah.instant('Button.Close') }}</ion-label>
        </ion-item>
      </ion-list>
    `
})
export class CommentPopPage {
  constructor(public popoverCtrl: PopoverController,
    public reddah: ReddahService
    ) {}

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
