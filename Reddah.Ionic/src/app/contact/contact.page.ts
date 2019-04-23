import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { NewFriendPage } from '../new-friend/new-friend.page';


@Component({
  selector: 'app-contact',
  templateUrl: 'contact.page.html',
  styleUrls: ['contact.page.scss']
})
export class ContactPage {

  requestCount: number;

  constructor(
    public localStorageService: LocalStorageService,
    public modalController: ModalController,
    public navController: NavController,
    public router: Router)
  {
      this.requestCount=2;
  }
  
  async viewNewFriends(){
      const newFriendModal = await this.modalController.create({
        component: NewFriendPage,
        componentProps: {  }
      });
        
      await newFriendModal.present();
  }

}
