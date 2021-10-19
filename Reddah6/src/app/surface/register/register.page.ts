import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { I18nService } from 'src/app/services/i18n.service';
import { CachingService } from 'src/app/services/caching.service';
import { TextService } from 'src/app/services/text.service';
import { ApiService } from 'src/app/services/api.service';
import { LoadingController } from '@ionic/angular';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

    showSigninWithApple = false;
    constructor(
        private modalController: ModalController,
        public i18n: I18nService,
        public text: TextService,
        private api: ApiService,
        private loadingController: LoadingController,
        private platform: Platform,
    ) { }

    locale;
    ngOnInit() {
        //this.locale = this.reddah.getCurrentLocale();
        this.generateUserName();
        if(this.platform.is('ipad')||this.platform.is('iphone')||this.platform.is('ios'))
        {
            this.showSigninWithApple = true;
        }
    }

    username = "";
    password = "";
    confirmpassword = "";
    email = "";
    agreed = false;

    async register() {
        if (this.username.length == 0) {
            this.text.toast(this.i18n.instant("Input.Error.UserNameEmpty"));
        }
        else if (this.username.length > 18) {
            this.text.toast(this.i18n.instant("Input.Error.UserNameTooLong"));
        }else if (this.password.length == 0) {
            this.text.toast(this.i18n.instant("Input.Error.PasswordEmpty"));
        }else if (this.email.length == 0) {
            this.text.toast(this.i18n.instant("Input.Error.EmailEmpty"));
        }
        else if (this.password!=this.confirmpassword) {
            this.text.toast(this.i18n.instant("Input.Error.PasswordDifferent"));
        }
        else if (!this.agreed) {
            this.text.toast(this.i18n.instant("Input.Error.Agree"));
        }
        else {
            const loading = await this.loadingController.create({
                cssClass: 'my-custom-class',
                spinner: null,
                duration: 30000,
                message: `<div class='bar-box'>${this.text.getLoadingEffect()}
                <div class='bar-text'>${this.i18n.instant("Register.Loading")}</div>
                </div>`,
                translucent: true,
                backdropDismiss: true
            });
            await loading.present();
            
            let formData = new FormData();
            formData.append("UserName", this.username);
            formData.append("Password", this.password);
            formData.append("Email", this.email);
            //formData.append("Locale", this.reddah.getCurrentLocale());
            //mail
            formData.append("MailTitle", this.i18n.instant("Mail.Title"));
            formData.append("MailSub", this.i18n.instant("Mail.Register.Sub"));
            formData.append("MailParaStart", this.i18n.instant("Mail.Register.ParaStart"));
            formData.append("MailParaEnd", this.i18n.instant("Mail.ParaEnd"));

            this.api.register(formData)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    //this.reddah.setLoginUserName(this.username);
                    this.text.toast(this.i18n.instant("Register.Success"), "primary");
                    this.modalController.dismiss(this.username);
                }
                else{
                    let msg = this.i18n.instant(`Service.${result.Success}`);
                    this.text.toast(msg, "danger");
                }
                
            });
        }
    }

    checkRegister(){
        return this.username=="" ||this.password==""||this.confirmpassword==""||this.email==""
        ||this.agreed==false||this.errorMessage!="";
    }

    async close(){
        await this.modalController.dismiss(null);
    }

    getLocale(){
        //return this.reddah.getCurrentLocale();
    }

    async browse(policy){
        this.text.Browser(`https://reddah.com/${this.locale}/t/help/${policy}`);
    }

    generateUserName(){
        this.username = this.text.generateUserName();
        this.checkUserName();
    }

    errorMessage = "";
    checkFlagUserName = false;
    checkFlagUserNamePass = false;
    async checkUserName(){
        if(this.username.length<6||this.username.length>18){
            this.errorMessage = this.i18n.instant(`Service.1001`);
            return;
        }

        this.checkFlagUserName = true;
        let formData = new FormData();
        formData.append("username",this.username)
        this.api.checkUserName(formData).subscribe(data=>{
            if(data.Success==0)
            {
                this.errorMessage = "";
                this.checkFlagUserNamePass = true;
            }
            else{
                this.errorMessage = this.i18n.instant(`Service.${data.Success}`);
            }
            this.checkFlagUserName = false;
        })

    }

    focusUserName(){
        this.checkFlagUserNamePass = false;
    }

    checkConfirmPassword(){
        if (this.password!=this.confirmpassword) {
            this.errorMessage = this.i18n.instant("Input.Error.PasswordDifferent");
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
            this.errorMessage = this.i18n.instant(`Service.1002`);
        }
    }

    private isEmail(email):boolean
    {
        const emailReg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/g
        return emailReg.test(email);
    }

    strength = "";
    testPwStrength() {
        var strongRegex = new RegExp(
                "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
            ),
            mediumRegex = new RegExp(
                "^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})"
            );

        if(this.password==""){
            this.strength = "";
        }
        else if (strongRegex.test(this.password)) {
            this.strength = "green";
        } else if (mediumRegex.test(this.password)) {
            this.strength = "blue";
        } else {
            this.strength = "orange";
        }

    }


}
