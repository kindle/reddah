import { Injectable } from '@angular/core';
import { ReddahService } from './reddah.service';
import { SigninPage } from './surface/signin/signin.page';
import { RegisterPage } from './surface/register/register.page';
import { ModalController } from '@ionic/angular';

@Injectable()
export class AuthService {

    constructor(
        private modalController: ModalController,
        private reddahService: ReddahService,
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
        /*
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
        */
    }


    logout(): void {
        this.reddahService.logout();
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