import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
    template: `
        <ion-list>
            <ion-item button (click)="foo()">
                <ion-icon slot="start" color="danger" name="bookmark"></ion-icon>  
                <ion-label>Bookmark this article</ion-label>
            </ion-item>    
            <ion-item button (click)="foo()">
                <ion-icon slot="start" color="primary" name="share"></ion-icon>  
                <ion-label>Share with friends</ion-label>
            </ion-item>
            <ion-item button (click)="foo()">
                <ion-icon slot="start" color="warning" name="alert"></ion-icon>  
                <ion-label>Report this article</ion-label>
            </ion-item>
        </ion-list>
    `
})
export class ArticlePopPage {
    constructor(public popoverCtrl: PopoverController) {}

    support() {
        this.popoverCtrl.dismiss();
    }

    close() {
        this.popoverCtrl.dismiss();
    }

    foo(){
      
    }
}
