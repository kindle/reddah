import { Injectable } from '@angular/core';
import { ReddahService } from './reddah.service';
import { SigninPage } from './surface/signin/signin.page';
import { RegisterPage } from './surface/register/register.page';
import { SurfacePage } from './surface/surface.page';
import { ModalController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable()
export class AuthService {

    constructor(
        private modalController: ModalController,
        private reddahService: ReddahService,
        private localStorageService: LocalStorageService,
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
            componentProps: { url: '' }
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
            componentProps: { url: '' }
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
            componentProps: { url: '' }
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

        this.localStorageService.clear("Reddah_GroupedContacts");
        this.localStorageService.clear("Reddah_Contacts");
        this.localStorageService.clear("Reddah_GroupedContacts_Pub");
        this.localStorageService.clear("Reddah_Contacts_pub");

        this.localStorageService.clear("Reddah_mytimeline");
        this.localStorageService.clear("Reddah_mytimeline_ids");

        this.localStorageService.clear("Reddah_Local_Messages");
        
        window.location.reload();
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

        if(!this.isExpired(exp)){
            this.reddahService.setCurrentUser(user);
            return true;
        }
        else{
          this.reddahService.clearCurrentUser();
          return false;
        }
    }

    isExpired(exp:number): boolean {
        if(!exp) return true;
        let now = Date.now();
        return now >= exp*1000;
    }
}