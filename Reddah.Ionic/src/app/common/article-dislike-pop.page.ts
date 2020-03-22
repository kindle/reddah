import { Component, Input } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';

@Component({
  template: `
      <ion-grid>
          <ion-row>
              <ion-col>
                  <div class="dislike-title">{{ reddah.instant('Pop.NoRecommend') }}</div>
              </ion-col>
              <ion-col>
                  <div class="dislike-title-right" (click)="close(feedback)">
                  {{ reddah.instant('Pop.Report') }}<ion-icon style="margin-right:5px;" size="small" color="dark" name="warning-outline"></ion-icon>
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
                  <div class="dislike-noreason">{{ reddah.instant('Pop.Nointerest') }}</div>
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
      public reddah: ReddahService,
      public popoverController: PopoverController,
      public modalController: ModalController,
  ) {}

  async close(reason){
      this.popoverController.dismiss(reason);
  }
}
