import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../../reddah.service';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
    selector: 'app-register-sub',
    templateUrl: './register-sub.page.html',
    styleUrls: ['./register-sub.page.scss'],
})
export class RegisterSubPage implements OnInit {

    constructor(private modalController: ModalController,
        private reddah: ReddahService,
        private loadingController: LoadingController,
        private translate: TranslateService,
        private iab: InAppBrowser,
    ) { }

    locale;
    ngOnInit() {
            this.locale = this.reddah.getCurrentLocale();
    }

    nickname = "";//as sub name
    signature = "";//as sub description
    email = "";
    agreed = false;

    async register() {
        if (this.nickname.length == 0) {
            this.reddah.toast(this.translate.instant("Input.Error.SubNameEmpty"));
        }else if (this.nickname.length < 2) {
            this.reddah.toast(this.translate.instant("Input.Error.SubNameTooShort"));
        }else if (this.signature.length == 0) {
            this.reddah.toast(this.translate.instant("Input.Error.SubDescEmpty"));
        }else if (this.email.length == 0) {
            this.reddah.toast(this.translate.instant("Input.Error.EmailEmpty"));
        }
        else if (!this.agreed) {
            this.reddah.toast(this.translate.instant("Input.Error.Agree"));
        }
        else {
            const loading = await this.loadingController.create({
                message: this.translate.instant("Register.Loading"),
                spinner: 'circles',
            });
            await loading.present();
            
            let formData = new FormData();
            formData.append("NickName", this.nickname);
            formData.append("Signature", this.signature);
            formData.append("Email", this.email);
            formData.append("Locale", this.reddah.getCurrentLocale());
            this.reddah.registerSub(formData)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    this.reddah.toast(this.translate.instant("Register.Success"), "primary");
                    
                    this.modalController.dismiss(true);
                }
                else{
                    this.reddah.toast(result.Message, "danger");
                }
                
            });
        }
    }

    async close(){
        await this.modalController.dismiss(null);
    }

    getLocale(){
        return this.reddah.getCurrentLocale();
    }

    async browse(policy){
        const browser = this.iab.create(`https://reddah.com/${this.locale}/t/help/${policy}`);
        browser.show();
        /*
        browser.executeScript(...);
        
        browser.insertCSS(...);
        browser.on('loadstop').subscribe(event => {
        browser.insertCSS({ code: "body{color: red;" });
        });
        
        browser.close();*/
    }
}
