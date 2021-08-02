import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { VideosPage } from '../videos/videos.page';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(
    private activeRouter: ActivatedRoute,
    public reddah: ReddahService,
    private modalController: ModalController,
  ) {}

  chapter = 0;
  ionViewDidEnter(){
    this.chapter = this.activeRouter.snapshot.queryParams["chapter"];
    

  }

}
