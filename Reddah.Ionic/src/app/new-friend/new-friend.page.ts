import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-new-friend',
  templateUrl: './new-friend.page.html',
  styleUrls: ['./new-friend.page.scss'],
})
export class NewFriendPage implements OnInit {
  
  formData: FormData;
  friendRequestList = [];

  constructor(
    private modalController: ModalController,
    private reddahService: ReddahService,
    private localStorageService: LocalStorageService) { }

  async ngOnInit() {
      this.loadRequests();
  }

  async loadRequests(){
    this.formData = new FormData();

    this.reddahService.friendRequests(this.formData)
        .subscribe(friendRequests => 
        {
            console.log(JSON.stringify(friendRequests))
            for(let friendRequest of friendRequests){
                this.friendRequestList.push(friendRequest);
            }
        }
    );
  }


  async close() {
      await this.modalController.dismiss(false);
  }

  async add(){

  }

  async search(){
      
  }

  async accept(requestUserName){
      this.formData = new FormData();
      this.formData.append("requestUserName", requestUserName);

      this.friendRequestList.forEach((item, index, alias)=> {
          if(item.UserName==requestUserName){
              item.Approve = true;
          }
      });

      this.reddahService.approveFriend(this.formData)
          .subscribe(result => 
          {
              if(result.Success!=0){
                  this.friendRequestList.forEach((item, index, alias)=> {
                      if(item.UserName==requestUserName){
                          item.Approve = false;
                      }
                  });
                  alert(result.Message);
              }
          }
      );
  }

}
