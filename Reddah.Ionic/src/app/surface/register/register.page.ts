import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { CacheService } from 'ionic-cache';
import { LocalStorageService } from 'ngx-webstorage';

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
        private cacheService: CacheService,
        private localStorageService: LocalStorageService,
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
        else if (this.username.length > 18) {
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
            //mail
            formData.append("MailTitle", this.translate.instant("Mail.Title"));
            formData.append("MailSub", this.translate.instant("Mail.Register.Sub"));
            formData.append("MailParaStart", this.translate.instant("Mail.Register.ParaStart"));
            formData.append("MailParaEnd", this.translate.instant("Mail.ParaEnd"));

            this.reddah.register(formData)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    this.reddah.setLoginUserName(this.username);
                    this.reddah.toast(this.translate.instant("Register.Success"), "primary");
                    this.modalController.dismiss(this.username);
                }
                else{
                    let msg = this.translate.instant(`Service.${result.Success}`);
                    this.reddah.toast(msg, "danger");
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

    errorMessage = "";
    checkFlagUserName = false;
    async checkUserName(){
        if(this.username.length<6||this.username.length>18){
            this.errorMessage = this.translate.instant(`Service.1001`);
            return;
        }

        this.checkFlagUserName = true;
        let formData = new FormData();
        formData.append("username",this.username)
        this.reddah.checkUserName(formData).subscribe(data=>{
            if(data.Success==0)
            {
                this.errorMessage = "";
            }
            else{
                this.errorMessage = this.translate.instant(`Service.${data.Success}`);
            }
            this.checkFlagUserName = false;
        })

    }

    checkConfirmPassword(){
        if (this.password!=this.confirmpassword) {
            this.errorMessage = this.translate.instant("Input.Error.PasswordDifferent");
        }
        else{
            this.errorMessage = "";
        }
    }


    checkEmail(){
        if(this.isEmail(this.email)){
            this.errorMessage = "";
        }
        else{
            this.errorMessage = this.translate.instant(`Service.1002`);
        }
    }

    private isEmail(email):boolean
    {
        const emailReg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/g
        return emailReg.test(email);
    }

}
