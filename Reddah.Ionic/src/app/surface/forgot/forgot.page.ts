import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, Slides } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CacheService } from "ionic-cache";
import { RegisterPage } from "../register/register.page"

@Component({
    selector: 'app-forgot',
    templateUrl: './forgot.page.html',
    styleUrls: ['./forgot.page.scss'],
})
export class ForgotPage implements OnInit {

    constructor(private modalController: ModalController,
        private reddah: ReddahService,
        private loadingController: LoadingController,
        private translate: TranslateService,
        private router: Router,
        private cacheService: CacheService,
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

    @ViewChild(Slides) slides: Slides;
    
    async token() {
        if (this.email.length == 0) {
            this.reddah.toast(this.translate.instant("Input.Error.EmailEmpty"));
        } 
        else {
            const loading = await this.loadingController.create({
                message: this.translate.instant("Button.Loading"),
                spinner: 'circles',
            });
            await loading.present();
            
            let formData = new FormData();
            formData.append("Email", this.email)
            //mail
            formData.append("MailTitle", this.translate.instant("Mail.Reset.Title"));
            formData.append("MailSub", this.translate.instant("Mail.Reset.Sub"));
            formData.append("MailParaStart", this.translate.instant("Mail.Reset.ParaStart"));
            formData.append("MailParaEnd", this.translate.instant("Mail.Reset.ParaEnd"));

            this.reddah.getSecurityToken(formData)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    this.reddah.toast(this.translate.instant("Input.Error.GetTokenFromEmail"), "primary");
                    //show change password ui
                    this.taber = false;
                }
                else {
                    let msg = this.translate.instant(`Service.${result.Success}`);
                    this.reddah.toast(msg, "danger");
                }
                
            });
        }
    }

    async submit(){
        if (this.password.length == 0) {
            this.reddah.toast(this.translate.instant("Input.Error.PasswordEmpty"));
        } 
        else if (this.confirmPassword.length == 0) {
            this.reddah.toast(this.translate.instant("Input.Error.PasswordEmpty"));
        } 
        else if (this.password != this.confirmPassword) {
            this.reddah.toast(this.translate.instant("Input.Error.PasswordDifferent"));
        } 
        else if (this.myToken.length == 0) {
            this.reddah.toast(this.translate.instant("Input.Error.TokenEmpty"));
        } 
        else {
            const loading = await this.loadingController.create({
                message: this.translate.instant("Button.Loading"),
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
                    this.reddah.toast(this.translate.instant("Input.Error.ResetResult"), "primary");
                    this.close();
                }
                else {
                    let msg = this.translate.instant(`Service.${result.Success}`);
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
