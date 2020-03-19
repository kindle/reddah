import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';

@Component({
    template: `
        <div (click)="close()">   
            <ion-item button (click)="back(1)">
                <ion-icon slot="start" style="margin-right:10px;" color="secondary" name="share"></ion-icon>  
                <ion-label>{{ reddah.instant('Menu.Contact') }}</ion-label>
            </ion-item>
            <ion-item button (click)="back(2)">
                <ion-icon slot="start" style="margin-right:10px;" color="primary" name="aperture"></ion-icon>  
                <ion-label>{{ reddah.instant('Menu.Timeline') }}</ion-label>
            </ion-item>
            <ion-item button (click)="reddah.addBookmark(ArticleId)">
                <ion-icon slot="start" style="margin-right:10px;" color="danger" name="bookmark"></ion-icon>  
                <ion-label>{{ reddah.instant('Menu.Mark') }}</ion-label>
            </ion-item>
            <ion-item button (click)="back(4)">
                <ion-icon slot="start" style="margin-right:10px;" color="medium" name="alert-circle-outline"></ion-icon>  
                <ion-label>{{ reddah.instant('Pop.Report') }}</ion-label>
            </ion-item>
            <ion-item button (click)="back(5)">
                <ion-icon slot="start" style="margin-right:10px;" color="dark" name="text-outline"></ion-icon>  
                <ion-label>{{ reddah.instant('Common.Font') }}</ion-label>
            </ion-item>
        </div>
    `
})
export class ArticlePopPage {
    @Input() ArticleId: number;

    constructor(
        public reddah: ReddahService,
        public popoverCtrl: PopoverController
    ) {}

    support() {
        this.popoverCtrl.dismiss();
    }

    close() {
        this.popoverCtrl.dismiss();
    }

    back(type:number){
        this.popoverCtrl.dismiss(type);
    }
}
