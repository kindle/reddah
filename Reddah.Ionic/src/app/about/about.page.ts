import { Component } from '@angular/core';


@Component({
  selector: 'app-about',
  templateUrl: 'about.page.html',
  styleUrls: ['about.page.scss']
})
export class AboutPage {

  //constructor(private wechat: Wechat) { }

  shareFriend(){
    //if(this.wechat.isInstalled())
        alert('friend');
    //else
    //    alert('wechat not installed')
  }

  shareTimeline(){
    alert('Timeline');
  }
}
