import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
    template: `
        <div>
            <ion-item button (click)="foo()">
                <ion-icon slot="start" color="tertiary" name="ios-person-add"></ion-icon>  
                <ion-label>添加朋友</ion-label>
            </ion-item>
            <ion-item button href="/scan">
                <ion-icon slot="start" color="tertiary" name="ios-qr-scanner"></ion-icon>  
                <ion-label>扫一扫</ion-label>
            </ion-item>
            <ion-item button (click)="foo()">
                <ion-icon slot="start" color="tertiary" name="ios-help-circle-outline"></ion-icon>  
                <ion-label>帮助与反馈</ion-label>
            </ion-item>
        </div>
    `
})
export class HeaderAddPage {
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
