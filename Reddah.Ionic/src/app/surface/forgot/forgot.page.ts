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
            this.reddah.getSecurityToken(formData)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    this.reddah.toast("Please get security token from your Email", "primary");
                    //show change password ui
                    this.taber = false;
                }
                else {
                    this.reddah.toast(result.Message, "danger");
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
            this.reddah.toast(this.translate.instant("请输入安全令牌"));
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
                    this.reddah.toast("Reset password successfully, please login", "primary");
                    this.close();
                }
                else {
                    this.reddah.toast(result.Message, "danger");
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
