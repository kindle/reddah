import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { LocalePage } from '../common/locale/locale.page';
import { SigninPage } from './signin/signin.page';
import { AuthService } from '../auth.service';
import { RegisterPage } from './register/register.page'
import { Globalization } from '@ionic-native/globalization/ngx';
import { UserPage } from '../common/user/user.page';

@Component({
    selector: 'app-surface',
    templateUrl: './surface.page.html',
    styleUrls: ['./surface.page.scss'],
    styles: ['surface-bg']
})
export class SurfacePage implements OnInit {

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private router: Router,
        private authService: AuthService,
        private localStorageService: LocalStorageService,
        private globalization: Globalization,
        private activeRouter: ActivatedRoute,
    ) {}

    ngOnInit() {
        let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
        let defaultLocale ="en-US"
        if(currentLocale==null){
            if(this.reddah.isMobile())
            { 
                this.globalization.getPreferredLanguage()
                .then(res => {
                    if(this.reddah.Locales.filter(l=>l.Name==res.value).length>0)
                    {
                        this.localStorageService.store("Reddah_Locale", res.value);
                        this.reddah.loadTranslate(res.value);
                    }
                    else{
                        this.localStorageService.store("Reddah_Locale", defaultLocale);
                        this.reddah.loadTranslate(defaultLocale);
                    }
                })
                .catch(e => {
                    this.localStorageService.store("Reddah_Locale", defaultLocale);
                    this.reddah.loadTranslate(defaultLocale);
                });
            }
            else{
                this.localStorageService.store("Reddah_Locale", defaultLocale);
                this.reddah.loadTranslate(defaultLocale);
            }

        }
        else{
            this.reddah.loadTranslate(currentLocale);
        }
        
        //setTimeout(()=>{this.tap()},1500)

        let slugUserName = this.activeRouter.snapshot.queryParams["slugUserName"];
        if(slugUserName!=null&&slugUserName.length>0){
            this.goUser(slugUserName);
        }
    }

    async goUser(userName){
        const modal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
    }

    isAuthenticated() {
        return this.authService.authenticated();
    }

    async register(){
        //this.config.isWorldVisible = false;

        const modal = await this.modalController.create({
            component: RegisterPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.reddah.preloadArticles(data)
            this.signin();
        }
        else{
            //this.config.isWorldVisible = true;
        }
    }

    async signin(){
        //this.config.isWorldVisible = false;
        
        const modal = await this.modalController.create({
            component: SigninPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            let result = this.authService.exactToken(data);
            if(result){
                this.router.navigate(['']);
            }
        }
        //else
        //{
            //this.config.isWorldVisible = true;
        //}
    }

    async locale(){
        //this.config.isWorldVisible = false;

        let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
        const changeLocaleModal = await this.modalController.create({
            component: LocalePage,
            componentProps: { orgLocale: currentLocale },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await changeLocaleModal.present();
        const { data } = await changeLocaleModal.onDidDismiss();
        if(data){
            let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
            this.reddah.loadTranslate(currentLocale);
        }
        //this.config.isWorldVisible = true;
        
    }


    tap(){
        if(this.isAuthenticated()){
            
            
        }
        else{
            
        }
    }


}
