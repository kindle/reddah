import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';

@Component({
    template: `
        <ion-item>
            <ion-icon slot="start" (click)="close(1)" color="primary" name="ribbon" size="medium"></ion-icon>
            <ion-note slot="start" color="dark" (click)="close(1)">{{ reddah.instant('Point.Award') }}</ion-note>
            <ion-icon slot="start" (click)="close(2)" color="medium" name="close-outline"size="medium"></ion-icon>
            <ion-note slot="start" color="dark" (click)="close(2)">{{ reddah.instant('Button.Close') }}</ion-note>
            <ion-icon slot="start" (click)="close(3)" color="dark" name="chatboxes" size="medium"></ion-icon>
            <ion-note slot="start" color="dark" (click)="close(3)">{{ reddah.instant('Comment.Comment') }}</ion-note>
        </ion-item>
    `
})
export class ReportCommentPopPage {

    constructor(public popoverCtrl: PopoverController,
        public reddah: ReddahService
        ) {}

    close(opt: number){
        this.popoverCtrl.dismiss(opt);
    }
}
