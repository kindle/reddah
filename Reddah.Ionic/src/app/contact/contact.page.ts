import { Component } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-contact',
  templateUrl: 'contact.page.html',
  styleUrls: ['contact.page.scss']
})
export class ContactPage {

  constructor(private localStorageService: LocalStorageService){

  }

  changeLocale(){
    let locale = this.localStorageService.retrieve("Reddah_Locale");
    if(locale==null)
      locale = "en-us";
    locale = locale == "en-us" ? "zh-cn" : "en-us"

    this.localStorageService.store("Reddah_Locale", locale);
  }
}
