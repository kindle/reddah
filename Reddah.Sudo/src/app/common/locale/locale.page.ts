import { Component, OnInit, Input, NgZone } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-locale',
    templateUrl: './locale.page.html',
    styleUrls: ['./locale.page.scss'],
})
export class LocalePage implements OnInit {
    @Input() orgLocale: string;

    selectedLocale: string;

    constructor(
        private localStorageService: LocalStorageService,
        private modalController: ModalController,
        public reddah: ReddahService,
        ) {
    }

    ngOnInit() {
        this.selectedLocale = this.orgLocale;
    }
    
    async changeLocale(selector: string) {
        this.localStorageService.store("Reddah_Locale", selector);
        this.selectedLocale = selector;
        this.reddah.loadTranslate(selector);
        this.reddah.clearLocaleCache();
        
        await this.modalController.dismiss(selector!==this.orgLocale);
    }

    async close() {
        await this.modalController.dismiss();
    }

}
