import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';
import { Article } from "../article";
import { PostviewerPage } from '../postviewer/postviewer.page';
import { StockPage } from '../stock/stock.page';

@Component({
    selector: 'app-search-user',
    templateUrl: './search-user.page.html',
    styleUrls: ['./search-user.page.scss'],
})
export class SearchUserPage implements OnInit {

    @ViewChild('searchKeyword') searchKeyword;

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
    ) { 
        
    }

    
    async ngOnInit() {
        
        setTimeout(() => {
            this.searchKeyword.setFocus();
        },150);
        
    }

    async close() {
        await this.modalController.dismiss();
    }

    async search(){
        
    }

}
