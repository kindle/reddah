import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';

@Component({
    template: `
        <div (click)="close()">
            <ion-item button (click)="foo()">
                <ion-icon slot="start" color="tertiary" name="ios-person-add"></ion-icon>  
                <ion-label>添加朋友</ion-label>
            </ion-item>
            <ion-item button href="/scan">
                <ion-icon slot="start" color="tertiary" name="ios-qr-scanner"></ion-icon>  
                <ion-label>扫一扫</ion-label>
            </ion-item>
            <ion-item button href="https://reddah.com/{{locale}}/r/feedbacks">
                <ion-icon slot="start" color="tertiary" name="ios-help-circle-outline"></ion-icon>  
                <ion-label>帮助与反馈</ion-label>
            </ion-item>
        </div>
    `
})
export class HeaderAddPage {
    locale;
    constructor(
        public popoverCtrl: PopoverController,
        public reddah: ReddahService,
        ) {
        this.locale = this.reddah.getCurrentLocale();
    }

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
