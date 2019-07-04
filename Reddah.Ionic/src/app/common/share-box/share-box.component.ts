import { Component, OnInit, Input } from '@angular/core';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { SearchPage } from '../search/search.page';
import { HeaderAddPage } from '../header-add-pop.page';

@Component({
    selector: 'app-share-box',
    templateUrl: './share-box.component.html',
    styleUrls: ['./share-box.component.scss']
})
export class ShareBoxComponent implements OnInit {

    @Input() title: string;

    constructor(
        private modalController: ModalController,
        private popoverController: PopoverController,
    ) { }

    ngOnInit() {
        
    }

    async goSearch(){
        const userModal = await this.modalController.create({
            component: SearchPage
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

}
