import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs';

import { LoginPage } from './login/login.page';
import { ModalController } from '@ionic/angular';

@Injectable()
export class AuthService {

  constructor(private localStorageService: LocalStorageService,
    private modalController: ModalController){}

  authenticated(): boolean {
    let currentUser = this.localStorageService.retrieve("Reddah_CurrentUser");
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
        alert(data);
        this.localStorageService.store("Reddah_CurrentUser","wind");
        //this.router.navigateByUrl('/tabs/(home:home)');
        //window.location.reload();
    }
    return true;

  }


  logout(): void {
    this.localStorageService.clear("Reddah_CurrentUser");
  }
}