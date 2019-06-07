import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { CacheService } from 'ionic-cache';

@Component({
    template: `
        <div (click)="close()">
            <ion-item button (click)="bookmark()" margin-end>
                <ion-icon slot="start" color="danger" name="bookmark"></ion-icon>  
                <ion-label>收藏</ion-label>
            </ion-item>    
            <ion-item button (click)="foo()">
                <ion-icon slot="start" color="primary" name="share"></ion-icon>  
                <ion-label>分享</ion-label>
            </ion-item>
            <ion-item button (click)="foo()">
                <ion-icon slot="start" color="warning" name="alert"></ion-icon>  
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

    async bookmark(){
        let formData = new FormData();
        formData.append("ArticleId", JSON.stringify(this.ArticleId));
        
        this.reddah.bookmark(formData).subscribe(result=>{
            if(result.Success==0)
            {
                this.reddah.presentToastWithOptions(`已收藏，请到到"我/收藏"查看`);
                this.cacheService.clearGroup("BookmarkPage");
            }
            else{
                alert(JSON.stringify(result.Message));
            }
        })
        
    }

    foo(){
      
    }
}
