import { Injectable } from '@angular/core';
import { ReddahService } from './reddah.service';
import { LoginPage } from './login/login.page';
import { ModalController } from '@ionic/angular';

@Injectable()
export class AuthService {

  constructor(
    private modalController: ModalController,
    private reddahService: ReddahService){}

  authenticated(): boolean {
      let currentUser = this.reddahService.getCurrentUser();
      return currentUser!=null;
  } ;  

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  async login() {
      const loginModal = await this.modalController.create({
        component: LoginPage,
        componentProps: { url: '' }
      });
      
      await loginModal.present();
      const { data } = await loginModal.onDidDismiss();
      if(data){
          //this.router.navigateByUrl('/tabs/(home:home)');
          //window.location.reload();
          this.exactToken(data);
      }
      return false;
  }


  logout(): void {
    this.reddahService.clearCurrentUser();
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