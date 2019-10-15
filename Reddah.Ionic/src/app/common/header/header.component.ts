import { Component, Input } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
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
        const popover = await this.popoverController.create({
            component: HeaderAddPage,
            event: ev,
            translucent: true,
            cssClass: 'header-add-popover'
        });
        return await popover.present();
    }

    async close(){
        await this.modalController.dismiss();
    }

}
