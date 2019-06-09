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
export class GroupChatOptPage implements OnInit {

    @Input() targetUsers;
    @Input() groupInfo;

    noDisturb=false;
    stickTop=false;
    strongReminder=false;

    showGroupNickName=true;
    
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
    }

    ngOnInit() {
    }

    async changeTitle(){
        const modal = await this.modalController.create({
            component: SettingGroupChatTitlePage,
            componentProps: { 
                targetGroupChatId: this.groupInfo.Id,
                currentTitle: this.groupInfo.Title
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

    async setBackground(){

    }

    async clearChat(){

    }

    async report(){

    }
    
    async close() {
        await this.modalController.dismiss();
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
                this.modalController.dismiss('delete');
            }
            else {
                alert(JSON.stringify(result.Message));
            }
        }); 
    }

    async addToGroupChat(){
        const modal = await this.modalController.create({
            component: ChooseUserPage
        });
            
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            data.forEach((contact)=>{
                this.groupInfo.GroupName += ","+contact.Watch;
            });

            let formData = new FormData();
            formData.append("Id", JSON.stringify(this.groupInfo.Id));
            formData.append("UserNames", JSON.stringify(data.map(d=>d.Watch)));
            this.reddah.addToGroupChat(formData).subscribe(data=>
            {
                if(data.Success==0){
                    this.cacheService.clearGroup("ChatChooseGroupPage");
                }    
            });
        }
    }

}
