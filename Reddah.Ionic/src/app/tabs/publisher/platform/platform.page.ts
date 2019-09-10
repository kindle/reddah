import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../../auth.service';
import { ReddahService } from '../../../reddah.service';
import { TranslateService } from '@ngx-translate/core';
import { CategoryPage } from '../category/category.page';
import { ManagePage } from '../manage/manage.page';
import { ReportPage } from '../../../mytimeline/report/report.page';

@Component({
    selector: 'app-platform',
    templateUrl: './platform.page.html',
    styleUrls: ['./platform.page.scss'],
})
export class PlatformPage implements OnInit {

    userName;
    locale;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public authService: AuthService,
        private alertController: AlertController,
        private translate: TranslateService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }


    ngOnInit() {

    }
    
    async close() {
        await this.modalController.dismiss();
    }

    async goApply(){
        const modal = await this.modalController.create({
            component: CategoryPage
        });
        await modal.present();
    }

    async goManage(){
        const modal = await this.modalController.create({
            component: ManagePage
        });
        await modal.present();
    }

    async goReport(){
        const modal = await this.modalController.create({
            component: ReportPage,
            componentProps: { 
            }
        });
          
        await modal.present();
    }

    isSuperAdmin(){
        // system admin
        let superAdmin = this.reddah.checkPermission("2");//2: delete post permission
        return superAdmin;
    }
}
