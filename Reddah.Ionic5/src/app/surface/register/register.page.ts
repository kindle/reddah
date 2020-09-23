import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
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
        public reddah: ReddahService,
        private loadingController: LoadingController,
        private platform: Platform,
    ) { }

    locale;
    ngOnInit() {
        this.locale = this.reddah.getCurrentLocale();
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
            this.reddah.toast(this.reddah.instant("Input.Error.UserNameEmpty"));
        }
        else if (this.username.length > 18) {
            this.reddah.toast(this.reddah.instant("Input.Error.UserNameTooLong"));
        }else if (this.password.length == 0) {
            this.reddah.toast(this.reddah.instant("Input.Error.PasswordEmpty"));
        }else if (this.email.length == 0) {
            this.reddah.toast(this.reddah.instant("Input.Error.EmailEmpty"));
        }
        else if (this.password!=this.confirmpassword) {
            this.reddah.toast(this.reddah.instant("Input.Error.PasswordDifferent"));
        }
        else if (!this.agreed) {
            this.reddah.toast(this.reddah.instant("Input.Error.Agree"));
        }
        else {
            const loading = await this.loadingController.create({
                cssClass: 'my-custom-class',
                spinner: null,
                duration: 5000,
                message: `<div class='bar-box'>${this.reddah.getLoadingEffect()}
                <div class='bar-text'>${this.reddah.instant("Register.Loading")}</div>
                </div>`,
                translucent: true,
                backdropDismiss: true
            });
            await loading.present();
            
            let formData = new FormData();
            formData.append("UserName", this.username);
            formData.append("Password", this.password);
            formData.append("Email", this.email);
            formData.append("Locale", this.reddah.getCurrentLocale());
            //mail
            formData.append("MailTitle", this.reddah.instant("Mail.Title"));
            formData.append("MailSub", this.reddah.instant("Mail.Register.Sub"));
            formData.append("MailParaStart", this.reddah.instant("Mail.Register.ParaStart"));
            formData.append("MailParaEnd", this.reddah.instant("Mail.ParaEnd"));

            this.reddah.register(formData)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    this.reddah.setLoginUserName(this.username);
                    this.reddah.toast(this.reddah.instant("Register.Success"), "primary");
                    this.modalController.dismiss(this.username);
                }
                else{
                    let msg = this.reddah.instant(`Service.${result.Success}`);
                    this.reddah.toast(msg, "danger");
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
        return this.reddah.getCurrentLocale();
    }

    async browse(policy){
        this.reddah.Browser(`https://reddah.com/${this.locale}/t/help/${policy}`);
    }

    generateUserName(){
        this.username = this.reddah.generateUserName();
        this.checkUserName();
    }

    errorMessage = "";
    checkFlagUserName = false;
    checkFlagUserNamePass = false;
    async checkUserName(){
        if(this.username.length<6||this.username.length>18){
            this.errorMessage = this.reddah.instant(`Service.1001`);
            return;
        }

        this.checkFlagUserName = true;
        let formData = new FormData();
        formData.append("username",this.username)
        this.reddah.checkUserName(formData).subscribe(data=>{
            if(data.Success==0)
            {
                this.errorMessage = "";
                this.checkFlagUserNamePass = true;
            }
            else{
                this.errorMessage = this.reddah.instant(`Service.${data.Success}`);
            }
            this.checkFlagUserName = false;
        })

    }

    focusUserName(){
        this.checkFlagUserNamePass = false;
    }

    checkConfirmPassword(){
        if (this.password!=this.confirmpassword) {
            this.errorMessage = this.reddah.instant("Input.Error.PasswordDifferent");
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
            this.errorMessage = this.reddah.instant(`Service.1002`);
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
