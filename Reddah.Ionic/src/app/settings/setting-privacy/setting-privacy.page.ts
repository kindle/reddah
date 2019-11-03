import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-setting-privacy',
    templateUrl: './setting-privacy.page.html',
    styleUrls: ['./setting-privacy.page.scss'],
})
export class SettingPrivacyPage implements OnInit {

    userName;
    locale;

    requireApproval= true;
    recommendContacts= false;
    allowTenTimeline=true;
    showLocation=false;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        public authService: AuthService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }


    ngOnInit() {
        this.showLocation = this.reddah.appData('userhidelocation_'+this.userName);
        this.allowTenTimeline = this.reddah.appData('userallowtentimeline_'+this.userName);
    }
    
    async close() {
        await this.modalController.dismiss();
    }

    async goEmail() {
        
    }

    async goPassword(){
        

    }

    async goSafeCenter(){
        
    }

    async changeAllowTsPeriod(value){

    }

    async changeApproval(){
        //this.requireApproval
    }

    async changeAllowTenTimeline(){
        this.changePrivacy("timeline", this.allowTenTimeline, 'userallowtentimeline');
        
    }

    async changeShowLocation(){
        this.changePrivacy("location", this.showLocation, 'userhidelocation');
    }

    private changePrivacy(type, value, r_key){
        let formData = new FormData();
        formData.append('targetType', type);
        formData.append('targetValue', value?"True":"False");
        this.reddah.changePrivacy(formData).subscribe(data=>{
            if(data.Success==0){
                this.reddah.toTextCache(value?1:0, `${r_key}_${this.userName}`);
            }
        });
    }

}
