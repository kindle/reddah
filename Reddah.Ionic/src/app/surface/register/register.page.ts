import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CacheService } from "ionic-cache";
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
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
        private translateService: TranslateService,
        private toastController: ToastController,
        private router: Router,
        private cacheService: CacheService,
        private iab: InAppBrowser,
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
    
    async presentToastWithOptions(message: string, color="dark") {
        const toast = await this.toastController.create({
            message: message,
            showCloseButton: true,
            position: 'top',
            closeButtonText: 'Close',
            duration: 3000,
            color: color
        });
        toast.present();
    }

    async register() {
        if (this.username.length == 0) {
            this.presentToastWithOptions("Please input your user name");
        }else if (this.password.length == 0) {
            this.presentToastWithOptions("Please input your password");
        }else if (this.email.length == 0) {
            this.presentToastWithOptions("Please input your email");
        }
        else if (this.password!=this.confirmpassword) {
            this.presentToastWithOptions("Password and confirm password are different");
        }
        else if (!this.agreed) {
            this.presentToastWithOptions("Please agree with user agreement");
        }
        else {
            const loading = await this.loadingController.create({
                message: this.translateService.instant("Article.Loading"),
                spinner: 'circles',
            });
            await loading.present();
            
            let formData = new FormData();
            formData.append("UserName", this.username);
            formData.append("Password", this.password);
            formData.append("Email", this.email);
            this.reddah.register(formData)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    this.reddah.setCurrentJwt(result.Message);
                    window.location.reload();
                }
                else{
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
}
