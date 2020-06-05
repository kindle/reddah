import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  showAppleSignIn = false;
  user = null;
  constructor(private alertController: AlertController) {}
  async ngOnInit() {
    const { Device } = Plugins;
    // Only show the Apple sign in button on iOS

    let device = await Device.getInfo();
    this.showAppleSignIn = device.platform === 'ios';
  }

  openAppleSignIn() {
    const { SignInWithApple } = Plugins;
    SignInWithApple.Authorize()
      .then(async (res) => {
        if (res.response && res.response.identityToken) {
          this.user = res.response;
        } else {
          this.presentAlert();
        }
      })
      .catch((response) => {
        this.presentAlert();
      });
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Login Failed',
      message: 'Please try again later',
      buttons: ['OK'],
    });
    await alert.present();
  }
}
