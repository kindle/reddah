import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserPage } from '../../common/user/user.page';
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../../reddah.service';
import { AddFriendPage } from '../add-friend/add-friend.page'
import { SearchUserPage } from '../search-user/search-user.page'

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
        public reddah: ReddahService,
        private localStorageService: LocalStorageService) { }

    ngOnInit() {
        this.loadRequests();
    }

    async loadRequests(){
        this.formData = new FormData();

        this.reddah.friendRequests(this.formData)
        .subscribe(friendRequests => 
        {
            for(let request of friendRequests){
                //check cache first
                //can abstract to fun(photourl, username){}
                let cachedUserPhotoPath = this.localStorageService.retrieve(`userphoto_${request.UserName}`);
                if(cachedUserPhotoPath!=null){
                    this.localStorageService.store("userphoto_"+request.UserName, 
                    (<any>window).Ionic.WebView.convertFileSrc(cachedUserPhotoPath));
                }
                
                if(request.UserPhoto!=null){
                    this.reddah.toImageCache(request.UserPhoto, `userphoto_${request.UserName}`);
                }
                this.friendRequestList.push(request);
            }
        });
    }


    async close() {
        await this.modalController.dismiss(this.hasAccepted);
    }

    async add(){

    }

    async addFriend(){
        const modal = await this.modalController.create({
            component: AddFriendPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    async searchUser(){
        const modal = await this.modalController.create({
            component: SearchUserPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    hasAccepted = false;
    async accept(requestUserName){
        this.formData = new FormData();
        this.formData.append("requestUserName", requestUserName);

        this.friendRequestList.forEach((item, index, alias)=> {
            if(item.UserName==requestUserName){
                item.Approve = true;
            }
        });

        this.reddah.approveFriend(this.formData)
        .subscribe(result => 
        {
            if(result.Success!=0){
                this.friendRequestList.forEach((item, index, alias)=> {
                    if(item.UserName==requestUserName){
                        item.Approve = false;
                    }
                });
                alert(result.Message);
            }else{
                this.hasAccepted = true;
            }
        });
    }

    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
        });
          
        await userModal.present();
    }


}
