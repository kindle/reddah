import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular'
import { TimelinePopPage } from '../article-pop/timeline-pop.page';

@Component({
  selector: 'app-add-timeline',
  templateUrl: './add-timeline.page.html',
  styleUrls: ['./add-timeline.page.scss'],
})
export class AddTimelinePage implements OnInit {

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
  }

  photos: Array<string>;

  async addNewPhoto(ev: any) {
    const popover = await this.popoverController.create({
        component: TimelinePopPage,
        event: ev,
        translucent: true
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();
    if(data==1)//photo
    {
        alert('take a photo');
    }
    else//from library
    {
    }
  }

}
