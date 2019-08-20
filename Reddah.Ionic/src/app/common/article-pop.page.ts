import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { CacheService } from 'ionic-cache';

@Component({
    template: `
        <div (click)="close()">   
            <ion-item button (click)="back(1)">
                <ion-icon slot="start" color="secondary" name="share"></ion-icon>  
                <ion-label>分享给好友</ion-label>
            </ion-item>
            <ion-item button (click)="back(2)">
                <ion-icon slot="start" color="primary" name="aperture"></ion-icon>  
                <ion-label>分享到光圈</ion-label>
            </ion-item>
            <ion-item button (click)="reddah.addBookmark(ArticleId)">
                <ion-icon slot="start" color="danger" name="bookmark"></ion-icon>  
                <ion-label>收藏</ion-label>
            </ion-item> 
            <ion-item button (click)="back(4)">
                <ion-icon slot="start" color="medium" name="alert"></ion-icon>  
                <ion-label>举报</ion-label>
            </ion-item>
        </div>
    `
})
export class ArticlePopPage {
    @Input() ArticleId: number;

    constructor(
        public reddah: ReddahService,
        public popoverCtrl: PopoverController,
        private cacheService: CacheService,
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
