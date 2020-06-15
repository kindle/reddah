import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonSlides } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LoadingController } from '@ionic/angular';

@Component({
    selector: 'app-forgot',
    templateUrl: './forgot.page.html',
    styleUrls: ['./forgot.page.scss'],
})
export class ForgotPage implements OnInit {

    constructor(private modalController: ModalController,
        public reddah: ReddahService,
        private loadingController: LoadingController,
    ) { }

    ngOnInit() {
        let lastLoginEmail = this.reddah.getLastLoginUserEmail();
        if(lastLoginEmail)
            this.email = lastLoginEmail;
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
            this.reddah.toast(this.reddah.instant("Input.Error.EmailEmpty"));
        } 
        else {
            const loading = await this.loadingController.create({
                message: this.reddah.instant("Button.Loading"),
                spinner: 'circles',
            });
            await loading.present();
            
            let formData = new FormData();
            formData.append("Email", this.email)
            //mail
            formData.append("MailTitle", this.reddah.instant("Mail.Reset.Title"));
            formData.append("MailSub", this.reddah.instant("Mail.Reset.Sub"));
            formData.append("MailParaStart", this.reddah.instant("Mail.Reset.ParaStart"));
            formData.append("MailParaEnd", this.reddah.instant("Mail.Reset.ParaEnd"));

            this.reddah.getSecurityToken(formData)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    this.reddah.toast(this.reddah.instant("Input.Error.GetTokenFromEmail"), "primary");
                    //show change password ui
                    this.taber = false;
                }
                else {
                    let msg = this.reddah.instant(`Service.${result.Success}`);
                    this.reddah.toast(msg, "danger");
                }
                
            });
        }
    }

    async submit(){
        if (this.password.length == 0) {
            this.reddah.toast(this.reddah.instant("Input.Error.PasswordEmpty"));
        } 
        else if (this.confirmPassword.length == 0) {
            this.reddah.toast(this.reddah.instant("Input.Error.PasswordEmpty"));
        } 
        else if (this.password != this.confirmPassword) {
            this.reddah.toast(this.reddah.instant("Input.Error.PasswordDifferent"));
        } 
        else if (this.myToken.length == 0) {
            this.reddah.toast(this.reddah.instant("Input.Error.TokenEmpty"));
        } 
        else {
            const loading = await this.loadingController.create({
                message: this.reddah.instant("Button.Loading"),
                spinner: 'circles',
            });
            await loading.present();
            
            let formData = new FormData();
            formData.append("Token", this.myToken)
            formData.append("Password", this.password)
            this.reddah.resetPassword(formData)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    this.reddah.toast(this.reddah.instant("Input.Error.ResetResult"), "primary");
                    this.close();
                }
                else {
                    let msg = this.reddah.instant(`Service.${result.Success}`);
                    this.reddah.toast(msg, "danger");
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
