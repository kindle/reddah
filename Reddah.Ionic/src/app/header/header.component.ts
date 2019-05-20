import { Component, OnInit, Input } from '@angular/core';
import { LoadingController, NavController, ModalController } from '@ionic/angular';
import { SearchPage } from '../search/search.page';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    @Input() title: string;

    constructor(private modalController: ModalController) { }

    ngOnInit() {
        
    }

    async goSearch(){
        const userModal = await this.modalController.create({
            component: SearchPage
        });
          
        await userModal.present();
    }

}
