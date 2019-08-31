import { Component, Input } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';

@Component({
  template: `
      <ion-grid>
          <ion-row>
              <ion-col>
                  <div class="dislike-title">{{ 'Pop.NoRecommend' | translate }}</div>
              </ion-col>
              <ion-col>
                  <div class="dislike-title-right" (click)="close(feedback)">
                  {{ 'Pop.Report' | translate }}<ion-icon size="small" color="medium" name="alert"></ion-icon>
                  </div>
              </ion-col>
          </ion-row>
          <ion-row *ngFor="let reason of Reasons;index as i">
              <ion-col (click)="close(reason[0])">
                  <div class="dislike-reason">{{reason[0].Title}}</div>
              </ion-col>
              <ion-col (click)="close(reason[1])" *ngIf="reason.length==2">
                  <div class="dislike-reason">{{reason[1].Title}}</div>
              </ion-col>
          </ion-row>
          <ion-row>
              <ion-col (click)="close(default)">
                  <div class="dislike-noreason">{{ 'Pop.Nointerest' | translate }}</div>
              </ion-col>
          </ion-row>
      </ion-grid>
  `
})
export class ArticleDislikePopPage {

  @Input() Reasons;

  default = {Id:0, Title:""};
  feedback = {Id:-1, Title:""};

  constructor(
      public popoverController: PopoverController,
      public modalController: ModalController,
  ) {}

  async close(reason){
      this.popoverController.dismiss(reason);
  }
}
