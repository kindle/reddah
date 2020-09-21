import { Component } from '@angular/core';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  userName;
  article = [500,501,502,503,504,505,506,507];
  constructor(
    public reddah: ReddahService,
  ) {

    /*let bgm = document.getElementById("bgm");
    if(bgm){
      bgm.play();
    }*/
    this.userName = this.reddah.getCurrentUser();
  }

}
