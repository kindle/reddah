import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Platform } from '@ionic/angular'; 

@Component({
    selector: 'app-setting-change-password',
    templateUrl: './setting-change-password.page.html',
    styleUrls: ['./setting-change-password.page.scss'],
})
export class SettingChangePasswordPage implements OnInit {

    userName;
    locale;

    submitClicked = false;

    constructor(
        private appVersion: AppVersion,
        private platform: Platform,
        private modalController: ModalController,
        public reddah: ReddahService,
        public authService: AuthService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
        
    }

    close(){
        this.modalController.dismiss();
    }

    ngOnInit() {
    }

    oldPassword;
    newPassword;
    confirmPassword;

    submit(){
        this.submitClicked = true;

        if(this.newPassword!=this.confirmPassword)
        {
            this.reddah.toast("新密码和确认密码不一致！", "danger");
            this.submitClicked = false;
        }
        else{
            let formData = new FormData();
            formData.append("OldPassword", this.oldPassword);
            formData.append("NewPassword", this.newPassword);
            
            this.reddah.changePassword(formData)
            .subscribe(result => 
            {
                if(result.Success==0){
                    this.reddah.toast("更改密码成功！", "primary");
                    this.modalController.dismiss();
                }
                else if(result.Success==3){
                    this.reddah.toast("旧密码不正确！", "danger");
                    this.submitClicked = false;
                }
                else{
                    alert(result.Message);
                }
            });
        }
    }
}
