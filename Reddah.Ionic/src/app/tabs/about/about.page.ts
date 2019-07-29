import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { NavController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { AuthService } from '../../auth.service';
import { TranslateService } from '@ngx-translate/core';
import { MyInfoPage } from '../../common/my-info/my-info.page';
import { SettingListPage } from '../../settings/setting-list/setting-list.page';
import { BookmarkPage } from '../../bookmark/bookmark.page';
import { PlatformPage } from '../publisher/platform/platform.page';

@Component({
    selector: 'app-about',
    templateUrl: 'about.page.html',
    styleUrls: ['about.page.scss']
})
export class AboutPage implements OnInit {
    
    userName: string;
    nickName: string;

    constructor(
        private localStorageService: LocalStorageService,
        public modalController: ModalController,
        public navController: NavController,
        public reddah: ReddahService,
        public authService: AuthService,
        public translateService: TranslateService,
    ) {
        this.userName = "Not Set";
        this.userName = this.localStorageService.retrieve("Reddah_CurrentUser");
    }
    
    ngOnInit() {
        this.reddah.getUserPhotos(this.userName);
    }

    async goPlatform(){
        const modal = await this.modalController.create({
            component: PlatformPage,
        });
        
        await modal.present();
    }

    async goSettings(){
        const modal = await this.modalController.create({
            component: SettingListPage,
        });
        
        await modal.present();
    }

    async takePhoto(){
        //go take a photo to my timeline
        
    }
    
    async myInfo() {
        const myInfoModal = await this.modalController.create({
            component: MyInfoPage,
            componentProps: {  }
        });
        
        await myInfoModal.present();
        const { data } = await myInfoModal.onDidDismiss();
        //check if change
        if(data)
            this.reddah.getUserPhotos(this.userName);
    }

    async goBookmark(){
        const modal = await this.modalController.create({
            component: BookmarkPage,
            componentProps: {  }
        });
        
        await modal.present();
    }

}
