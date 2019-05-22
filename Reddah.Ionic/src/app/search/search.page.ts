import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.page.html',
    styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

    userName: string;

    showTopic=true;

    topics = [
        [['文章'],['好友'],['朋友圈']],
        [['公众号'],['小程序'],['表情']],
    ];

    chooseTopic(col){
        this.showTopic = false;
        this.searchKeyword.placeholder += col;
        setTimeout(() => {
            this.searchKeyword.setFocus();
        },150);
    }

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
    ) { 
        this.userName = this.reddah.getCurrentUser();
    }

    @ViewChild('searchKeyword') searchKeyword;

    async ngOnInit() {
        setTimeout(() => {
            this.searchKeyword.setFocus();
        },150);
    }

    async close() {
        await this.modalController.dismiss();
    }


}
