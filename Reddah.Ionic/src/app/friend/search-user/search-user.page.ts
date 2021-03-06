import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { ReddahService } from '../../reddah.service';
import { UserPage } from '../../common/user/user.page'
import { SearchPage } from '../../common/search/search.page'

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
        private cacheService: CacheService,
    ) { 
        this.userHistories = this.reddah.getHistory(5);
    }

    user404= false;
    ngOnInit() {
        
        setTimeout(() => {
            this.searchKeyword.setFocus();
        },150);
        
    }

    async close() {
        await this.modalController.dismiss();
    }

    async onchange(){
        this.user404 = false;
    }

    async search(){
        let cacheKey = "this.reddah.searchUser" + this.searchKeyword.value;
        let formData = new FormData();
        formData.append("targetUser", this.searchKeyword.value);
        let request = this.reddah.searchUser(formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "SearchUserPage")
        .subscribe(result => 
        {
            if(result.Success==0){
                this.goUser(this.searchKeyword.value);
            }
            else if(result.Success==404)
            {
                this.user404 = true;
            }
            else{
                alert(result.Message);
            }
        });


        this.reddah.refreshHistoryCache(this.userHistories, this.searchKeyword.value, 5);
    }

    async searchMore(){
        const userModal = await this.modalController.create({
            component: SearchPage,
            componentProps: { 
                key: this.searchKeyword.value,
                type: -1
            },
            cssClass: "modal-fullscreen",
        });
          
        await userModal.present();
    }

    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
        });
          
        await userModal.present();
    }


    userHistories=[];

    searchHistory(value){
        this.searchKeyword.value = value;
        this.search();
    }

    clearHistory(id){
        if(id==5)
            this.userHistories = [];

        if(id==5)
            this.reddah.clearHistory(id);
    }
}
