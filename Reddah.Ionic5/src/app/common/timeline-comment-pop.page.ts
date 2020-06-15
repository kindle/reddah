import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';

@Component({
    template: `
        <ion-item lines="none" color="light">
            <div style="display: flex;margin-top:5px;">
                <ion-icon slot="start" (click)="close(1)" color="danger" name="heart-outline" size="medium" *ngIf="!liked"></ion-icon>
                <ion-label style="margin-left:5px;" slot="start" color="dark" (click)="close(1)" *ngIf="!liked">{{ reddah.instant('Comment.Like') }}</ion-label>
                <ion-icon slot="start" (click)="close(2)" color="danger" name="heart-dislike-outline" size="medium" *ngIf="liked"></ion-icon>
                <ion-label style="margin-left:5px;" slot="start" color="dark" (click)="close(2)" *ngIf="liked">{{ reddah.instant('Confirm.Cancel') }}</ion-label>
                <ion-icon style="margin-left:10px;" slot="start" (click)="close(3)" color="primary" name="chatbox-ellipses-outline" size="medium"></ion-icon>
                <ion-label style="margin-left:5px;" slot="start" color="dark" (click)="close(3)">{{ reddah.instant('Comment.Comment') }}</ion-label>
            </div>
        </ion-item>
    `
})
export class TimelineCommentPopPage {
    @Input() liked: boolean;

    constructor(
        public popoverCtrl: PopoverController,
        public reddah: ReddahService,
        ) {}

    close(opt: number){
        this.popoverCtrl.dismiss(opt);
    }
}
