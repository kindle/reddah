import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CacheService } from "ionic-cache";
import { RegisterPage } from "../register/register.page"

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
        private toastController: ToastController,
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
    
    
    async presentToastWithOptions(message: string, color="dark") {
        const toast = await this.toastController.create({
            message: message,
            showCloseButton: true,
            position: 'top',
            closeButtonText: this.translate.instant("Button.Close"),
            duration: 3000,
            color: color
        });
        toast.present();
    }

    async logIn() {
        if (this.username.length == 0) {
            this.presentToastWithOptions(this.translate.instant("Input.Error.UserNameEmpty"));
        } else if (this.password.length == 0) {
            this.presentToastWithOptions(this.translate.instant("Input.Error.PasswordEmpty"));
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
                        }
                    });
                    this.cacheService.clearAll();
                }
                else {
                    this.presentToastWithOptions(result.Message, "danger");
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

}
