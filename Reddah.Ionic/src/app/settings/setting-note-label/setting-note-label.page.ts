import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-setting-note-label',
    templateUrl: './setting-note-label.page.html',
    styleUrls: ['./setting-note-label.page.scss'],
})
export class SettingNoteLabelPage implements OnInit {

    @Input() targetUserName;
    @Input() currentNoteName;

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
        formData.append("targetUser", this.targetUserName);
        formData.append("targetNoteName", this.currentNoteName);
        
        this.reddah.changeNoteName(formData)
        .subscribe(result => 
        {
            if(result.Success==0){
                this.reddah.appPhoto['usernotename_'+this.targetUserName+'_'+this.userName] = this.currentNoteName;
                this.localStorageService.store('usernotename_'+this.targetUserName+'_'+this.userName, this.currentNoteName);
                this.modalController.dismiss(true);
            }
            else
                alert(result.Message);
        });
    }

}
