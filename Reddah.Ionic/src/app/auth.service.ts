import { Injectable } from '@angular/core';
import { ReddahService } from './reddah.service';
import { SigninPage } from './surface/signin/signin.page';
import { RegisterPage } from './surface/register/register.page';
import { SurfacePage } from './surface/surface.page';
import { ModalController, Platform } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { CacheService } from 'ionic-cache';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class AuthService {

    constructor(
        private modalController: ModalController,
        private reddahService: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        private platform: Platform,
        private router: Router,
        private translate: TranslateService,
    ){}

    authenticated(): boolean {
        let currentUser = this.reddahService.getCurrentUser();
        return currentUser!=null;
    } ;  

    // store the URL so we can redirect after logging in
    redirectUrl: string;

    async register() {
        const modal = await this.modalController.create({
            component: RegisterPage,
            componentProps: { url: '' },
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            //this.router.navigateByUrl('/tabs/(home:home)');
            //window.location.reload();
            this.exactToken(data);
        }
        return false;
    }

    async signin() {
        const modal = await this.modalController.create({
            component: SigninPage,
            componentProps: { url: '' },
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            //this.router.navigateByUrl('/tabs/(home:home)');
            //window.location.reload();
            this.exactToken(data);
        }
        return false;
    }

    async surface() {
        const modal = await this.modalController.create({
            component: SurfacePage,
            componentProps: { url: '' },
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            //this.router.navigateByUrl('/tabs/(home:home)');
            //window.location.reload();
            this.exactToken(data);
        }
        return false;
    }


    logout(): void {
        this.reddahService.logoutClear();

        this.localStorageService.clear("Reddah_GroupedContacts_"+this.reddahService.getCurrentUser());
        this.localStorageService.clear("Reddah_Contacts_"+this.reddahService.getCurrentUser());
        this.cacheService.clearGroup("ContactPage");
        this.localStorageService.clear("Reddah_GroupedContacts_Pub_"+this.reddahService.getCurrentUser());
        this.localStorageService.clear("Reddah_Contacts_pub_"+this.reddahService.getCurrentUser());
        this.cacheService.clearGroup("PubPage");

        this.localStorageService.clear("Reddah_mytimeline_"+this.reddahService.getCurrentUser());
        this.localStorageService.clear("Reddah_mytimeline_ids_"+this.reddahService.getCurrentUser());



        this.localStorageService.clear("Reddah_Local_Messages_"+this.reddahService.getCurrentUser());
        //this.localStorageService.clear();
        
        if(this.platform.is('android')){
            window.location.reload();
        }
        else{
            this.modalController.dismiss();

            let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
            this.translate.setDefaultLang(currentLocale);
            this.translate.use(currentLocale);

            this.router.navigate(['/surface'], {
                queryParams: {
                }
            });
        }
    }


    exactToken(jwt: string){
        let parts = jwt.split('.');
        let bodyEnc = parts[1];
        if(!bodyEnc){
            return false;
        }
        let bodyStr = atob(bodyEnc)
            , body;

        try{
            body = JSON.parse(bodyStr);
        }
        catch(e){
            body = {};
        }

        let exp = body.exp
            , user= body.aud
        ;

        if(!this.reddahService.isExpired(exp)){
            this.reddahService.setCurrentUser(user);
            return true;
        }
        else{
          this.reddahService.clearCurrentUser();
          return false;
        }
    }

    
}