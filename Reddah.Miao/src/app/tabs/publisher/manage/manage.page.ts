import { Component, OnInit, ViewChild } from '@angular/core';
import { ReddahService } from '../../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ActionSheetController, IonContent  } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { CacheService } from "ionic-cache";
import { SubInfoPage } from '../sub-info/sub-info.page';

@Component({
  selector: 'app-manage',
  templateUrl: 'manage.page.html',
  styleUrls: ['manage.page.scss']
})
export class ManagePage implements OnInit {
    
    async close(){
        await this.modalController.dismiss();
    }

    constructor(public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public actionSheetController: ActionSheetController,
        ){
        
    }

    subs=[];
    groupedSubs = [];
    userName;

    ngOnInit(){
        let cachedGroupSubs = this.localStorageService.retrieve("Reddah_GroupedSubs_"+this.userName);
        if(cachedGroupSubs){
            this.groupedSubs = JSON.parse(cachedGroupSubs);
        }
        this.loadData(null);
    }

    //drag down
    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    @ViewChild('pageTop') pageTop: IonContent;
    
    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("ManageSubsPage");
        this.localStorageService.clear("Reddah_GroupedSubs_"+this.userName);
        this.localStorageService.clear("Reddah_Subs_"+this.userName);
        this.groupedSubs=[];
        this.subs = [];
        this.loadData(event);
    }

    showLoading = false;
    loadData(event){
        let cachedGroupSubs = this.localStorageService.retrieve("Reddah_GroupedSubs_"+this.userName);
        let cachedSubs = this.localStorageService.retrieve("Reddah_Subs_"+this.userName);
        if(!cachedGroupSubs||!cachedSubs)
        {
            this.showLoading = true;
        }

        let cacheKey = "this.reddah.manage.subs";
        let request = this.reddah.getSubs();

        this.cacheService.loadFromObservable(cacheKey, request, "ManageSubsPage")
        .subscribe(subs => 
        {
            let cachedGroupSubs = this.localStorageService.retrieve("Reddah_GroupedSubs_"+this.userName);
            let cachedSubs = this.localStorageService.retrieve("Reddah_Subs_"+this.userName);

            if(cachedSubs!=JSON.stringify(subs)||!cachedGroupSubs){
                this.localStorageService.store("Reddah_Subs_"+this.userName, JSON.stringify(subs));

                for(let sub of subs){
                    //cache user image
                    this.reddah.getUserPhotos(sub.UserName);
                    let cname = sub.NickName;
                    let ch = cname.charAt(0);
                    
                    if(/^[A-Za-z]/.test(ch))//English
                        sub.s = ch.toLowerCase();
                    else
                        sub.s = this.reddah.getSortLetter(ch,'zh');
                }
                
                this.groupSubs(subs);
                this.localStorageService.store("Reddah_GroupedSubs_"+this.userName, JSON.stringify(this.groupedSubs));
                this.localStorageService.store("Reddah_Subs_"+this.userName, JSON.stringify(subs));
            }
            
            this.showLoading = false;
            if(event){
                event.target.complete();
            }
            
        });  
    }

    groupSubs(subs){

        this.subs = [];
        this.groupedSubs = [];

        let sortedSubs = subs.sort((a,b)=> a.s.localeCompare(b.s));
        let currentLetter = false;
        let currentSubs = [];

        sortedSubs.forEach((value, index, alias) => {
            if(value.s.charAt(0) != currentLetter){
                currentLetter = value.s.charAt(0);
                let newGroup = {
                    letter: currentLetter,
                    subs: []
                };
                currentSubs = newGroup.subs;
                this.groupedSubs.push(newGroup);
                
            } 
            currentSubs.push(value);
        });
    }


    async subInfo(sub) {
        //console.log(sub)
        const myInfoModal = await this.modalController.create({
            component: SubInfoPage,
            componentProps: { 
                targetSub: sub
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await myInfoModal.present();
        const { data } = await myInfoModal.onDidDismiss();
        //check if change
        if(data){
            this.reddah.ClearPub();
            this.ngOnInit();
            this.reddah.getUserPhotos(sub.UserName);
        }
            
    }

}
