import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { LocalePage } from '../../common/locale/locale.page';
import { UserPage } from '../../common/user/user.page';
import { SettingGroupChatTitlePage } from '../../settings/setting-group-chat-title/setting-group-chat-title.page';

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

}
