import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Location } from '@angular/common';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private modalController: ModalController,
    private location: Location,
    private reddah: ReddahService) { }

  ngOnInit() {
  }

  
  username:string;
  password:string;
  
  async logIn() {
      if (this.username.length == 0) {
          alert("请输入账号");
      } else if (this.password.length == 0) {
          alert("请输入密码");
      } else {
          let userinfo: string = '用户名：' + this.username + '密码：' + this.password;
          
          this.reddah.login(this.username, this.password)
            .subscribe(result => 
              {
                  alert(JSON.stringify(result));
                  //loading.dismiss();
                  if(true){
                    this.modalController.dismiss(true);
                  }

              }
          );


          

      }
  }

  async goback(){
    await this.modalController.dismiss(false);
  }
}
