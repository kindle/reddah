import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-setting-group-chat-title',
    templateUrl: './setting-group-chat-title.page.html',
    styleUrls: ['./setting-group-chat-title.page.scss'],
})
export class SettingGroupChatTitlePage implements OnInit {

    @Input() targetGroupChatId;
    @Input() currentTitle;

    submitClicked = false;
        
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public authService: AuthService,
        private toastController: ToastController,
    ) {}

    ngOnInit() {}
    
    async close() {
        await this.modalController.dismiss();
    }

    async submit() {
        this.submitClicked = true;
        
        let formData = new FormData();
        formData.append("targetGroupChatId", JSON.stringify(this.targetGroupChatId));
        formData.append("targetTitle", this.currentTitle);
        
        this.reddah.changeGroupChatTitle(formData)
        .subscribe(result => 
        {
            if(result.Success==0){
                this.modalController.dismiss({newTitle: this.currentTitle});
            }
            else
                alert(result.Message);
        });
    }

}
