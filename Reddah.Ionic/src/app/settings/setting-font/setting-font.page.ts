import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';
import { SettingAboutPage } from '../setting-about/setting-about.page';
import { LocalePage } from '../../common/locale/locale.page';
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
        private cacheService: CacheService,
        public authService: AuthService,
        private translate: TranslateService,
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
            {Content: "预览字体大小", UserName: this.userName, Type:0},
            {Content: "拖动下面的滑块，可设置字体大小", UserName: '', Type:0},
            {Content: "设置后，会改变聊天、菜单和时光圈的字体大小。会当凌绝顶，一览众山小。", UserName: '', Type:0},
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
