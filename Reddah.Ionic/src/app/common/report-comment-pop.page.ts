import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
    template: `
        <ion-item>
            <ion-icon slot="start" (click)="close(1)" color="primary" name="checkmark-circle" size="medium"></ion-icon>
            <ion-note slot="start" color="dark" (click)="close(1)">{{ 'Confirm.Title' | translate }}</ion-note>
            <ion-icon slot="start" (click)="close(2)" color="medium" name="close" size="medium"></ion-icon>
            <ion-note slot="start" color="dark" (click)="close(2)">{{ 'Button.Close' | translate }}</ion-note>
            <ion-icon slot="start" (click)="close(3)" color="dark" name="chatboxes" size="medium"></ion-icon>
            <ion-note slot="start" color="dark" (click)="close(3)">{{ 'Comment.Comment' | translate }}</ion-note>
        </ion-item>
    `
})
export class ReportCommentPopPage {

    constructor(public popoverCtrl: PopoverController) {}

    close(opt: number){
        this.popoverCtrl.dismiss(opt);
    }
}
