import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-setting-nickname',
    templateUrl: './setting-nickname.page.html',
    styleUrls: ['./setting-nickname.page.scss'],
})
export class SettingNickNamePage implements OnInit {

    @Input() currentNickName;

    submitClicked = false;
        
    userName;
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public authService: AuthService,
        private toastController: ToastController,
    ) {
        this.userName = this.reddah.getCurrentUser();
    }

    ngOnInit() {}
    
    async close() {
        await this.modalController.dismiss();
    }

    async submit() {
        this.submitClicked = true;
        
        let formData = new FormData();
        formData.append("targetNickName", this.currentNickName);
        
        this.reddah.changeNickName(formData)
        .subscribe(result => 
        {
            if(result.Success==0){
                this.localStorageService.store('usernickname_'+this.userName, this.currentNickName);
                this.modalController.dismiss(true);
            }
            else
                alert(result.Message);
        });
    }

}
