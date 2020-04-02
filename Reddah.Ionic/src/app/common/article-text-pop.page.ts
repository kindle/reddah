import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';

@Component({
    template: `
        <ion-item color="light" style="--padding-start:0;" lines="none">
            <ion-icon name="chevron-back-outline" (click)="close()" class="backbutton"></ion-icon>
        </ion-item>
        <ion-content padding>
            <div [innerHTML]="reddah.htmlDecode(text)"></div>
        </ion-content>
    `
})
export class ArticleTextPopPage {
    constructor(
        public modalController: ModalController,
        public reddah: ReddahService,
    ) {}

    @Input() text: string

    async close() {
        await this.modalController.dismiss(false);
    }

}
