import { Component, OnInit} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-setting-font',
    templateUrl: './setting-font.page.html',
    styleUrls: ['./setting-font.page.scss'],
})
export class SettingFontPage implements OnInit {

    userName;
    locale;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        public authService: AuthService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
        let currentFontSize = this.localStorageService.retrieve("Reddah_fontsize");
        if(!currentFontSize)
            currentFontSize = 2;
        this.fontSize = currentFontSize;
    }

    messages;
    ngOnInit() {
        this.messages = [
            {Content: this.reddah.instant("Common.Font1"), UserName: this.userName, Type:0},
            {Content: this.reddah.instant("Common.Font2"), UserName: '', Type:0},
            {Content: this.reddah.instant("Common.Font3"), UserName: '', Type:0},
        ];
    }
    
    async close() {
        await this.modalController.dismiss();
    }


    fontSize=2;
    async changeFontSize(){
        document.documentElement.style.setProperty(`--ion-font-size`, this.reddah.fontSizeMap.get(this.fontSize));
        this.localStorageService.store("Reddah_fontsize", this.fontSize);
    }

    
}
