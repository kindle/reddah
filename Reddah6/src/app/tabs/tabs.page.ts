import { Component } from '@angular/core';
import { ReddahService } from '../services/reddah.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(public reddahService: ReddahService) {
    let currentLocale = "zh-CN";
    this.reddahService.loadTranslate(currentLocale);
  }

}
