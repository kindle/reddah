import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor() {}

  tabNum = 1;
  alsoClick(id){
    this.tabNum = id;
    this.play();
  }

  play(){
    let audio = new Audio();
    
    //audio.src = "/assets/running/run.wav"; 
    audio.src = "/assets/audio/drop.mp3"; 
    audio.play();
  }

}
