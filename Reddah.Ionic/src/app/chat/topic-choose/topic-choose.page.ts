import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-topic-choose',
    templateUrl: './topic-choose.page.html',
    styleUrls: ['./topic-choose.page.scss'],
})
export class TopicChoosePage implements OnInit {

    userName;
    locale;
    topicChoose;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public authService: AuthService,
        private toastController: ToastController,
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
    }


    ngOnInit() {
        this.loadTopicClouds();
    }

    loadTopicClouds(){

    }

    async close() {
        this.modalController.dismiss(this.topicChoose);
    }

    async submit(){
        this.topicChoose = "test"
        this.modalController.dismiss(this.topicChoose);
    }

    filterTopics(event){

    }

}
