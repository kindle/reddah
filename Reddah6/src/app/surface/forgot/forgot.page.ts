import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonSlides } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { I18nService } from 'src/app/services/i18n.service';
import { CachingService } from 'src/app/services/caching.service';
import { TextService } from 'src/app/services/text.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-forgot',
    templateUrl: './forgot.page.html',
    styleUrls: ['./forgot.page.scss'],
})
export class ForgotPage implements OnInit {

    constructor(private modalController: ModalController,
        public i18n: I18nService,
        public text: TextService,
        private api: ApiService,
        private loadingController: LoadingController,
    ) { }

    ngOnInit() {
        //let lastLoginEmail = this.reddah.getLastLoginUserEmail();
        //if(lastLoginEmail)
        //    this.email = lastLoginEmail;
    }

    
    email = "";
    password = "";
    confirmPassword = "";
    myToken = "";
    taber = true;

    slideOpts = {
        centeredSlides: 'true',
        initialSlide: 0,
    };

    @ViewChild(IonSlides) slides: IonSlides;
    
    async token() {
        if (this.email.length == 0) {
            this.text.toast(this.i18n.instant("Input.Error.EmailEmpty"));
        } 
        else {
            const loading = await this.loadingController.create({
                cssClass: 'my-custom-class',
                spinner: null,
                duration: 30000,
                message: `<div class='bar-box'>${this.text.getLoadingEffect()}
                <div class='bar-text'>${this.i18n.instant("Button.Loading")}</div>
                </div>`,
                translucent: true,
                backdropDismiss: true
            });
            await loading.present();
            
            let formData = new FormData();
            formData.append("Email", this.email)
            //mail
            formData.append("MailTitle", this.i18n.instant("Mail.Reset.Title"));
            formData.append("MailSub", this.i18n.instant("Mail.Reset.Sub"));
            formData.append("MailParaStart", this.i18n.instant("Mail.Reset.ParaStart"));
            formData.append("MailParaEnd", this.i18n.instant("Mail.Reset.ParaEnd"));

            this.api.getSecurityToken(formData)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    this.text.toast(this.i18n.instant("Input.Error.GetTokenFromEmail"), "primary");
                    //show change password ui
                    this.taber = false;
                }
                else {
                    let msg = this.i18n.instant(`Service.${result.Success}`);
                    this.text.toast(msg, "danger");
                }
                
            });
        }
    }

    async submit(){
        if (this.password.length == 0) {
            this.text.toast(this.i18n.instant("Input.Error.PasswordEmpty"));
        } 
        else if (this.confirmPassword.length == 0) {
            this.text.toast(this.i18n.instant("Input.Error.PasswordEmpty"));
        } 
        else if (this.password != this.confirmPassword) {
            this.text.toast(this.i18n.instant("Input.Error.PasswordDifferent"));
        } 
        else if (this.myToken.length == 0) {
            this.text.toast(this.i18n.instant("Input.Error.TokenEmpty"));
        } 
        else {
            const loading = await this.loadingController.create({
                cssClass: 'my-custom-class',
                spinner: null,
                duration: 30000,
                message: `<div class='bar-box'>${this.text.getLoadingEffect()}
                <div class='bar-text'>${this.i18n.instant("Button.Loading")}</div>
                </div>`,
                translucent: true,
                backdropDismiss: true
            });
            await loading.present();
            
            let formData = new FormData();
            formData.append("Token", this.myToken)
            formData.append("Password", this.password)
            this.api.resetPassword(formData)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    this.text.toast(this.i18n.instant("Input.Error.ResetResult"), "primary");
                    this.close();
                }
                else {
                    let msg = this.i18n.instant(`Service.${result.Success}`);
                    this.text.toast(msg, "danger");
                }
                
            });
        }
    }

    async close(){
        await this.modalController.dismiss(null);
    }

    async change(){
        this.taber = !this.taber;
    }

}
