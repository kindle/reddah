import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private modalController: ModalController) { }

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
          alert(userinfo);
          if(true){
            await this.modalController.dismiss(true);
          }

      }
  }
}
