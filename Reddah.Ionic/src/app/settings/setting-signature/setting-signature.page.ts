import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-setting-signature',
    templateUrl: './setting-signature.page.html',
    styleUrls: ['./setting-signature.page.scss'],
})
export class SettingSignaturePage implements OnInit {

    @Input() currentSignature;

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
        formData.append("targetSignature", this.currentSignature);
        
        this.reddah.changeSignature(formData)
        .subscribe(result => 
        {
            if(result.Success==0){
                this.localStorageService.store('usersignature_'+this.userName, this.currentSignature);
                this.modalController.dismiss(true);
            }
            else
                alert(result.Message);
        });
    }

}
