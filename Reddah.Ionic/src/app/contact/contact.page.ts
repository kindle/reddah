import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-contact',
  templateUrl: 'contact.page.html',
  styleUrls: ['contact.page.scss']
})
export class ContactPage {

  constructor(
    public localStorageService: LocalStorageService,
    public modalController: ModalController,
    public navController: NavController,
    public router: Router)
  {

  }
  

}
