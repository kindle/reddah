import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  template: `
  <ion-header>
    <ion-item>
        <ion-icon slot="start" name="ios-arrow-back" (click)="close()"></ion-icon>
    </ion-item>
  </ion-header>
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
