import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    template: `
    <ion-item color="light" no-padding lines="none">
        <ion-icon slot="start" name="ios-arrow-back" (click)="close()" class="backbutton"></ion-icon>
    </ion-item>
    <ion-content padding>
      <ion-label>
        {{text}}
      </ion-label>
    </ion-content>
    `
})
export class ArticleTextPopPage {
    constructor(
        public modalController: ModalController,
    ) {}

    @Input() text: string

    async close() {
        await this.modalController.dismiss(false);
    }

}
