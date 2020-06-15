import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-apply-friend',
    templateUrl: './apply-friend.page.html',
    styleUrls: ['./apply-friend.page.scss'],
})
export class ApplyFriendPage implements OnInit {

  @ViewChild('newRequest') newRequest;
  @Input() targetUserName: string;
  targetNoteName: string;
  
  formData: FormData;
  message: string;
  permission: false;


  constructor(
      private modalController: ModalController,
      public reddahService: ReddahService,
      public reddah: ReddahService,
  ) { }

  ngOnInit() {
      this.message = `${this.reddahService.instant('Common.ApplyFriendMe')} ${this.reddahService.getCurrentUser()}`; 
      this.targetNoteName = this.targetUserName;
      setTimeout(() => {
        this.newRequest.setFocus();
      },150);
  }

  submitClicked=false;
  async submit() {
      this.submitClicked = true;
      this.formData = new FormData();
      this.formData.append("targetUser", this.targetUserName);
      this.formData.append("targetNoteName", this.targetNoteName);
      this.formData.append("permission", this.permission?"Allow":"NotAllow");
      this.formData.append("message", this.message);

      this.reddahService.addFriend(this.formData)
          .subscribe(result => 
          {
              //console.log(result);
              this.modalController.dismiss(false);
          }
      );
      
  }

  async close() {
      await this.modalController.dismiss(false);
  }

}
