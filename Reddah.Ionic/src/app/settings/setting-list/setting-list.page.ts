import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { SettingAboutPage } from '../setting-about/setting-about.page';
import { SettingAccountPage } from '../setting-account/setting-account.page';
import { SettingGePage } from '../setting-ge/setting-ge.page';
import { SettingPrivacyPage } from '../setting-privacy/setting-privacy.page';
import { AddFeedbackPage } from 'src/app/mytimeline/add-feedback/add-feedback.page';
import { SettingNetworkPage } from '../setting-network/setting-network.page';

@Component({
    selector: 'app-setting-list',
    templateUrl: './setting-list.page.html',
    styleUrls: ['./setting-list.page.scss'],
})
export class SettingListPage implements OnInit {

    userName;
    locale;
    @Input() currentLocale;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        public authService: AuthService,
        private alertController: AlertController,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }


    ngOnInit() {

    }
    
    async close() {
        await this.modalController.dismiss();
    }

    async logout() {
        const alert = await this.alertController.create({
            header: this.reddah.instant("Confirm.Title"),
            message: this.reddah.instant("Confirm.LogoutMessage"),
            buttons: [
            {
                text: this.reddah.instant("Confirm.Cancel"),
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {}
            }, 
            {
                text: this.reddah.instant("Confirm.Yes"),
                handler: () => {
                    this.authService.logout();
                }
            }]
        });

        await alert.present().then(()=>{});
    }


    async goAccount(){
        const modal = await this.modalController.create({
            component: SettingAccountPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
    }

    async goNetwork(){
        const modal = await this.modalController.create({
            component: SettingNetworkPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
    }

    async goPrivacy(){
        const modal = await this.modalController.create({
            component: SettingPrivacyPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
    }

    async goGeneral(){
        const modal = await this.modalController.create({
            component: SettingGePage,
            componentProps: {currentLocale:this.currentLocale},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.modalController.dismiss(data);
        }
    }


    async goAbout(){
        const modal = await this.modalController.create({
            component: SettingAboutPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
    }


    async goFeedback(){
        const modal = await this.modalController.create({
            component: AddFeedbackPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

}
