import { Component, OnInit, Input, ViewChild, NgZone } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-setting-sex',
    templateUrl: './setting-sex.page.html',
    styleUrls: ['./setting-sex.page.scss'],
})
export class SettingSexPage implements OnInit {

    @Input() currentSex;//1:male,0:female
    @Input() title;

    submitClicked = false;
        
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        public authService: AuthService,
    ) {
        this.userName = this.reddah.getCurrentUser();
    }

    userName: string;

    async ngOnInit() {
    }
    
    async close() {
        await this.modalController.dismiss();
    }

    async submit() {
        this.submitClicked = true;
        
        let formData = new FormData();
        formData.append("UserSex", JSON.stringify(this.currentSex));
        
        this.reddah.changeSex(formData)
        .subscribe(result => 
        {
            if(result.Success==0){
                this.localStorageService.store('usersex_'+this.userName, this.currentSex);
                this.modalController.dismiss(true);
            }
            else
                alert(result.Message);
        });
    }

    async setSex(n){
        this.currentSex = n;
    }

}
