import { Component, Input } from '@angular/core';
import { ModalController, PopoverController, Platform } from '@ionic/angular';
import { SearchPage } from '../search/search.page';
import { HeaderAddPage } from '../header-add-pop.page';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

    @Input() title: string;
    @Input() back: boolean;

    constructor(
        private modalController: ModalController,
        private popoverController: PopoverController,
        private platform: Platform,
    ) { }

    async goSearch(){
        const userModal = await this.modalController.create({
            component: SearchPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
          
        await userModal.present();
    }

    async add(ev: any) {
        let cssName = 'header-add-popover';
        if(this.platform.is('android')){
            cssName = 'header-add-popover';
        }
        else{
            cssName = 'header-add-popover-ios';
        }

        const popover = await this.popoverController.create({
            component: HeaderAddPage,
            event: ev,
            translucent: true,
            cssClass: cssName
        });
        return await popover.present();
    }

    async close(){
        await this.modalController.dismiss();
    }

}
