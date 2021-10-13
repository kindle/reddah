import { Component } from '@angular/core';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(public i18n: I18nService) {
    let currentLocale = "zh-CN";
    this.i18n.loadTranslate(currentLocale);
  }

}
