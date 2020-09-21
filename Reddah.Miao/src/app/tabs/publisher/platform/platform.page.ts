import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { AuthService } from '../../../auth.service';
import { ReddahService } from '../../../reddah.service';
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
        public authService: AuthService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }

    async goDoc(){
        this.reddah.Browser(`https://reddah.com/${this.locale}/t/wiki/Pages/api/index`);
    }

    ngOnInit() {

    }
    
    async close() {
        await this.modalController.dismiss();
    }

    async goApply(){
        const modal = await this.modalController.create({
            component: CategoryPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        await modal.present();
    }

    async goManage(){
        const modal = await this.modalController.create({
            component: ManagePage,
            componentProps: {},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        await modal.present();
    }

    async goReport(){
        const modal = await this.modalController.create({
            component: ReportPage,
            componentProps: { 
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
    }

    isSuperAdmin(){
        // system admin
        let superAdmin = this.reddah.checkPermission("2");//2: delete post permission
        return superAdmin;
    }
}
