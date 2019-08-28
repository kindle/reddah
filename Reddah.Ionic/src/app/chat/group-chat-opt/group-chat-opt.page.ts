import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { ChooseUserPage } from '../../common/choose-user/choose-user.page';
import { UserPage } from '../../common/user/user.page';
import { SettingGroupChatTitlePage } from '../../settings/setting-group-chat-title/setting-group-chat-title.page';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-group-chat-opt',
    templateUrl: './group-chat-opt.page.html',
    styleUrls: ['./group-chat-opt.page.scss'],
})
export class GroupChatOptPage {

    @Input() targetUsers;
    @Input() groupInfo;

    noDisturb=false;
    stickTop=false;
    strongReminder=false;

    showGroupNickName=true;
    userName;
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public authService: AuthService,
        private toastController: ToastController,
        private alertController: AlertController,
        private translate: TranslateService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
    }

    async changeTitle(){
        const modal = await this.modalController.create({
            component: SettingGroupChatTitlePage,
            componentProps: { 
                targetGroupChatId: this.groupInfo.Id,
                currentTitle: this.groupInfo.Title,
                title: '设置群名称',
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data)
        {
            this.groupInfo.Title = data.newTitle;
            this.cacheService.clearGroup("ChatChooseGroupPage");
        }
    }

    async changeAnnounce(){
        const modal = await this.modalController.create({
            component: SettingGroupChatTitlePage,
            componentProps: { 
                targetGroupChatId: this.groupInfo.Id,
                currentContent: this.groupInfo.Content,
                title: '设置群公告',
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data)
        {
            this.groupInfo.Content = data.newText;
            this.cacheService.clearGroup("ChatChooseGroupPage");
        }
    }

    async setBackground(){

    }

    async clearChat(){
        const alert = await this.alertController.create({
            header: this.translate.instant("Confirm.Title"),
            message: this.translate.instant("Confirm.ClearChatMessage"),
            buttons: [
            {
                text: this.translate.instant("Confirm.Cancel"),
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {}
            }, 
            {
                text: this.translate.instant("Confirm.Yes"),
                handler: () => {
                    this.modalController.dismiss('clearchat');
                }
            }]
        });

        await alert.present().then(()=>{});
    }

    async report(){

    }
    
    async close() {
        await this.modalController.dismiss(this.changeFlag);
    }

    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            }
        });
            
        await userModal.present();
    }

    async leaveGroupChatConfirm(){
        const alert = await this.alertController.create({
            header: this.translate.instant("Confirm.Title"),
            message: this.translate.instant("Confirm.LeaveGroupChatMessage"),
            buttons: [
            {
                text: this.translate.instant("Confirm.Cancel"),
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {}
            }, 
            {
                text: this.translate.instant("Confirm.Yes"),
                handler: () => {
                    this.leaveGroupChat()
                }
            }]
        });

        await alert.present().then(()=>{
        
        });;
    }

    async leaveGroupChat(){
        let formData = new FormData();
        formData.append("Id", JSON.stringify(this.groupInfo.Id));
        this.reddah.deleteGroupChat(formData).subscribe(result=>{
            if(result.Success==0){
                this.cacheService.clearGroup("ChatChooseGroupPage");
                this.localStorageService.clear("Reddah_Local_Messages");
                this.modalController.dismiss('delete');
            }
            else {
                alert(JSON.stringify(result.Message));
            }
        }); 
    }

    changeFlag;
    async addToGroupChat(){
        const modal = await this.modalController.create({
            component: ChooseUserPage,
            componentProps: { 
                "addedUsers" : this.groupInfo.GroupName,   
                "delete": false
            } 
        });
            
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            
            this.groupInfo.GroupName = data.join(',');

            let formData = new FormData();
            formData.append("Id", JSON.stringify(this.groupInfo.Id));
            formData.append("UserNames", JSON.stringify(data));
            this.reddah.addToGroupChat(formData).subscribe(data=>
            {
                if(data.Success==0){
                    this.cacheService.clearGroup("ChatChooseGroupPage");
                }    
            });

            this.changeFlag = "update";
        }
    }

    async delFromGroupChat(){
        const modal = await this.modalController.create({
            component: ChooseUserPage,
            componentProps: { 
                "addedUsers" : this.groupInfo.GroupName,   
                "delete": true
            } 
        });
            
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.groupInfo.GroupName = data.join(',');

            let formData = new FormData();
            formData.append("Id", JSON.stringify(this.groupInfo.Id));
            formData.append("UserNames", JSON.stringify(data));
            this.reddah.addToGroupChat(formData).subscribe(data=>
            {
                if(data.Success==0){
                    this.cacheService.clearGroup("ChatChooseGroupPage");
                }    
            });
            
            this.changeFlag = "update";
        }
    }

}
