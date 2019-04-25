import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { ChangePhotoPage } from '../change-photo/change-photo.page';
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';


@Component({
  selector: 'app-my-info',
  templateUrl: './my-info.page.html',
  styleUrls: ['./my-info.page.scss'],
})
export class MyInfoPage implements OnInit {

  constructor(
    private modalController: ModalController,
    private reddahService: ReddahService,
    private localStorageService: LocalStorageService) { }

  async ngOnInit() {
      
  }


  async close() {
      await this.modalController.dismiss(false);
  }

  async changePhoto(){
      const userModal = await this.modalController.create({
        component: ChangePhotoPage,
        componentProps: { title: "更换头像" }
      });
        
      await userModal.present();
      const { data } = await userModal.onDidDismiss();
  }

}
