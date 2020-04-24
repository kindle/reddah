import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { SettingChangePasswordPage } from '../setting-change-password/setting-change-password.page';

@Component({
    selector: 'app-setting-network',
    templateUrl: './setting-network.page.html',
    styleUrls: ['./setting-network.page.scss'],
})
export class SettingNetworkPage implements OnInit {

    currentNetwork = 1;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        public authService: AuthService,
    ) { 
        this.currentNetwork = this.reddah.getCurrentNetwork();
    }


    ngOnInit() {
        
    }
    
    async close() {
        await this.modalController.dismiss();
    }

    async changeNetwork(n){
        this.currentNetwork = n;
        this.reddah.setCurrentNetwork(n);
    }

}
