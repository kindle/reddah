import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

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

    username = "";
    password = "";
    confirmpassword = "";
    email = "";
    agreed = false;

    async register() {
        if (this.username.length == 0) {
            this.reddah.toast(this.translate.instant("Input.Error.UserNameEmpty"));
        }
        else if (this.username.length >= 25) {
            this.reddah.toast(this.translate.instant("Input.Error.UserNameTooLong"));
        }else if (this.password.length == 0) {
            this.reddah.toast(this.translate.instant("Input.Error.PasswordEmpty"));
        }else if (this.email.length == 0) {
            this.reddah.toast(this.translate.instant("Input.Error.EmailEmpty"));
        }
        else if (this.password!=this.confirmpassword) {
            this.reddah.toast(this.translate.instant("Input.Error.PasswordDifferent"));
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
            formData.append("UserName", this.username);
            formData.append("Password", this.password);
            formData.append("Email", this.email);
            formData.append("Locale", this.reddah.getCurrentLocale());
            this.reddah.register(formData)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    this.reddah.setLoginUserName(this.username);
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
