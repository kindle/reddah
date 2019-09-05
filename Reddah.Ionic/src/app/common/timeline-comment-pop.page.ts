import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
    template: `
        <ion-item>
            <ion-icon slot="start" (click)="close(1)" color="danger" name="heart-empty" size="medium" *ngIf="!liked"></ion-icon>
            <ion-note slot="start" color="dark" (click)="close(1)" *ngIf="!liked">{{ 'Comment.Like' | translate }}</ion-note>
            <ion-icon slot="start" (click)="close(2)" color="danger" name="heart-empty" size="medium" *ngIf="liked"></ion-icon>
            <ion-note slot="start" color="dark" (click)="close(2)" *ngIf="liked">{{ 'Confirm.Cancel' | translate }}</ion-note>
            <ion-icon slot="start" (click)="close(3)" color="primary" name="chatboxes" size="medium"></ion-icon>
            <ion-note slot="start" color="dark" (click)="close(3)">{{ 'Comment.Comment' | translate }}</ion-note>
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
