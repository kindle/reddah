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
        this.modalController.dismiss();
    }

    async submit(){
        this.modalController.dismiss(this.topicChoose);
    }

    loading = false;
    topicList = [];
    filterTopics(ev){
        var val = ev.target.value;
        this.topicChoose = val;

        if(val&&val.length>0){
            this.loading = true;
            let formData = new FormData();
            formData.append("key", val);
    
            let cacheKey = "this.reddah.getSearchTopic"+val;
            let request = this.reddah.getSearchTopic(formData);
    
            this.cacheService.loadFromObservable(cacheKey, request, "TopicChoosePage")
            .subscribe(topics => 
            {
                this.topicList = topics;
                this.loading = false;
            });
        }
    }

    chooseTopic(val){
        this.modalController.dismiss(val);
    }

}
