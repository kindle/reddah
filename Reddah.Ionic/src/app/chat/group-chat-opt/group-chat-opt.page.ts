import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { LocalePage } from '../../common/locale/locale.page';
import { UserPage } from '../../common/user/user.page';

@Component({
    selector: 'app-group-chat-opt',
    templateUrl: './group-chat-opt.page.html',
    styleUrls: ['./group-chat-opt.page.scss'],
})
export class GroupChatOptPage implements OnInit {

    @Input() targetUsers;
    @Input() groupInfo;

    userName;
    locale;

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
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }


    ngOnInit() {
        this.currentLocaleInfo = "Not Set";
        const locale = this.localStorageService.retrieve("Reddah_Locale");
        this.reddah.Locales.forEach((value, index, arr)=>{
            if(locale===value.Name)
                this.currentLocaleInfo = value.Description;
        });
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

    logout() {
        this.authService.logout();
    }

    currentLocaleInfo;
    async changeLocale(){
        let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
        const changeLocaleModal = await this.modalController.create({
            component: LocalePage,
            componentProps: { orgLocale: currentLocale }
        });
        
        await changeLocaleModal.present();
        const { data } = await changeLocaleModal.onDidDismiss();
        if(data){
            window.location.reload();
        }

    }

    async clearCache(){
        this.cacheService.clearAll();
        this.presentToastWithOptions("已清除缓存");
    }

    async presentToastWithOptions(message: string) {
        const toast = await this.toastController.create({
            message: message,
            showCloseButton: true,
            position: 'top',
            closeButtonText: 'Close',
            duration: 3000
        });
        toast.present();
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
