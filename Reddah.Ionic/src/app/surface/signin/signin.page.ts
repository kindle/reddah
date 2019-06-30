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
        private translateService: TranslateService,
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
    
    
    async presentToastWithOptions(message: string) {
        const toast = await this.toastController.create({
            message: message,
            showCloseButton: true,
            position: 'top',
            closeButtonText: 'Close',
            duration: 3000
        });
        toast.present();
    }

    async logIn() {
        if (this.username.length == 0) {
            this.presentToastWithOptions("Please input your user name");
        } else if (this.password.length == 0) {
            this.presentToastWithOptions("Please input your password");
        } else {
            const loading = await this.loadingController.create({
                message: this.translateService.instant("Article.Loading"),
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
                else if(result.Success==1){
                    //Input user name or password is empty
                    alert(result.Message);
                }
                else if(result.Success==2){
                    //"Username or Password is wrong"
                    this.presentToastWithOptions(result.Message);
                }
                else if(result.Success==3){
                    //other errors
                    alert(result.Message);
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
