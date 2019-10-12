import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { LocalePage } from '../../common/locale/locale.page';
import { UserPage } from '../../common/user/user.page';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-chat-opt',
    templateUrl: './chat-opt.page.html',
    styleUrls: ['./chat-opt.page.scss'],
})
export class ChatOptPage implements OnInit {

    @Input() targetUser;
    userName;
    locale;

    noDisturb=false;
    stickTop=false;
    strongReminder=false;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public authService: AuthService,
        private alertController: AlertController,
        private toastController: ToastController,
        private translate: TranslateService,
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
            this.reddah.windowReload();
        }

    }

    async clearCache(){
        this.cacheService.clearAll();
        this.reddah.toast(this.translate.instant("Common.CacheClear"));
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
