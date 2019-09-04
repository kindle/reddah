import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CacheService } from "ionic-cache";
import { RegisterPage } from "../register/register.page"
import { ForgotPage } from "../forgot/forgot.page";

@Component({
    selector: 'app-signin',
    templateUrl: './signin.page.html',
    styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {

    constructor(private modalController: ModalController,
        private reddah: ReddahService,
        private loadingController: LoadingController,
        private translate: TranslateService,
        private router: Router,
        private cacheService: CacheService,
    ) { }

    ngOnInit() {
        let lastLoginUserName = this.reddah.getLoginUserName();
        if(lastLoginUserName)
            this.username = lastLoginUserName;
    }

    
    username = "";
    password = "";
    
    async logIn() {
        if (this.username.length == 0) {
            this.reddah.toast(this.translate.instant("Input.Error.UserNameEmpty"));
        } else if (this.password.length == 0) {
            this.reddah.toast(this.translate.instant("Input.Error.PasswordEmpty"));
        } else {
            const loading = await this.loadingController.create({
                message: this.translate.instant("Login.Loading"),
                spinner: 'circles',
            });
            await loading.present();
            
            this.reddah.login(this.username, this.password)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    this.reddah.setLoginUserName(this.username);
                    this.reddah.setCurrentJwt(result.Message);
                    // return token successfully
                    this.modalController.dismiss(result.Message);
                    this.router.navigate(['/'], {
                        queryParams: {
                            action: 'login'
                        }
                    });
                    this.cacheService.clearAll();
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

    getLocale(){
        return this.reddah.getCurrentLocale();
    }

    async goRegister(){
        const modal = await this.modalController.create({
            component: RegisterPage,
            componentProps: { url: '' }
        });
        
        await modal.present();
    }

    async forgot(){
        const modal = await this.modalController.create({
            component: ForgotPage
        });
        
        await modal.present();
    }

}
