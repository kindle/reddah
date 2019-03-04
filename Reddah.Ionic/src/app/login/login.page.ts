import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private modalController: ModalController,
    private reddah: ReddahService,
    private loadingController: LoadingController,
    private translateService: TranslateService,
    private toastController: ToastController) { }

  ngOnInit() {
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
          alert("请输入账号");
      } else if (this.password.length == 0) {
          alert("请输入密码");
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
                  // return token successfully
                  this.modalController.dismiss(result.Message);
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

  async goback(){
      await this.modalController.dismiss(null);
  }

}
