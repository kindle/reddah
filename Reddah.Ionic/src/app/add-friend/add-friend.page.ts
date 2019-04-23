import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.page.html',
  styleUrls: ['./add-friend.page.scss'],
})
export class AddFriendPage implements OnInit {

  @ViewChild('newRequest') newRequest;
  @Input() targetUserName: string;
  targetNoteName: string;
  
  formData: FormData;
  message: string;
  permission: false;


  constructor(
    private modalController: ModalController,
    private reddahService: ReddahService,
    private localStorageService: LocalStorageService) { }

  async ngOnInit() {
      this.message = `我是${this.reddahService.getCurrentUser()}`; 
      this.targetNoteName = this.targetUserName;
      setTimeout(() => {
        this.newRequest.setFocus();
      },150);
  }

  async submit() {
      this.formData = new FormData();
      this.formData.append("targetUser", this.targetUserName);
      this.formData.append("targetNoteName", this.targetNoteName);
      this.formData.append("permission", this.permission?"Allow":"NotAllow");
      this.formData.append("message", this.message);

      this.reddahService.addFriend(this.formData)
          .subscribe(result => 
          {
              console.log(result);
              this.modalController.dismiss(false);
          }
      );
      
  }

  async close() {
      await this.modalController.dismiss(false);
  }

}
