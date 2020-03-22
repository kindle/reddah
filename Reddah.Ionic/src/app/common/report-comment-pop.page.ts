import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';

@Component({
    template: `
        <ion-item lines="none">
            <div style="display: flex;margin-top:5px;">
                <ion-icon slot="start" (click)="close(1)" color="primary" name="ribbon" size="medium"></ion-icon>
                <ion-label slot="start" color="dark" (click)="close(1)">{{ reddah.instant('Point.Award') }}</ion-label>
                <ion-icon style="margin-left:5px;" slot="start" (click)="close(2)" color="dark" name="close-circle-outline"size="medium"></ion-icon>
                <ion-label slot="start" color="dark" (click)="close(2)">{{ reddah.instant('Button.Close') }}</ion-label>
                <ion-icon style="margin-left:5px;" slot="start" (click)="close(3)" color="dark" name="chatbox-ellipses-outline" size="medium"></ion-icon>
                <ion-label slot="start" color="dark" (click)="close(3)">{{ reddah.instant('Comment.Comment') }}</ion-label>
            </div>
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
