import { Component, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular'
import { ScanPage } from '../../common/scan/scan.page';
import { SearchPage } from '../../common/search/search.page';
import { ShakePage } from '../../shake/shake.page';
import { ReddahService } from '../../reddah.service';
import { LocationPage } from '../../common/location/location.page';
import { MagicMirrorPage } from '../../common/magic-mirror/magic-mirror.page';
import { WormHolePage } from '../../common/worm-hole/worm-hole.page';
import {  Router } from '@angular/router';
import { MysticPage } from '../../common/mystic/mystic.page';
import { StoryPage } from '../../story/story.page';
import { MapPage } from '../../map/map.page';
import { PlatformPage } from '../publisher/platform/platform.page';
import { ShareChooseChatPage } from '../../chat/share-choose-chat/share-choose-chat.page';
import { AddFeedbackPage } from '../../mytimeline/add-feedback/add-feedback.page';
import { MiniViewerComponent } from '../../common/mini-viewer/mini-viewer.component';

@Component({
  selector: 'app-find',
  templateUrl: 'find.page.html',
  styleUrls: ['find.page.scss']
})
export class FindPage {

    userName;
    user_apps=[];

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private router: Router,
    ){
        this.user_apps = this.reddah.loadRecent(4);
        this.loadSuggestMini();
    }

    loadSuggestMini(){
        let recentList = this.reddah.loadRecent(4).map(x=>x.UserName);
        let cacheKey = "this.reddah.getSuggestMinis";
        //let request = this.reddah.getSuggestMinis();

        //this.cacheService.loadFromObservable(cacheKey, request, "SearchPage")

        recentList.forEach((item, index, alias)=>{
            this.reddah.getUserPhotos(item.UserName);
        });

        this.reddah.getSuggestMinis()
        .subscribe(data=>{
            
            data.forEach((item, index, alias)=>{
                if(recentList.indexOf(item.UserName)>-1){
                    item.isRecent = true;
                }
                this.reddah.getUserPhotos(item.UserName);
            });

            this.user_apps = this.user_apps.concat(data.filter(x=>!x.isRecent));

        })
    }

    async startScanner(){
        const scanModal = await this.modalController.create({
            component: ScanPage,
            componentProps: { },
            cssClass: "modal-fullscreen",
        });
        
        await scanModal.present();
        const { data } = await scanModal.onDidDismiss();
        if(data){
            //console.log(data)
        }

    };

    async goSearch(){
        const userModal = await this.modalController.create({
            component: SearchPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
          
        await userModal.present();
    }

    async shake(){
        let myLocationstr = this.reddah.appData("userlocationjson_"+this.userName);
        let myLocation = null;
        try{
            myLocation = JSON.parse(myLocationstr);
        }catch(e){}
        if(myLocation&&myLocation.location){
            const modal = await this.modalController.create({
                component: ShakePage,
                componentProps: {},
                cssClass: "modal-fullscreen",
            });
              
            await modal.present();
        }
        else{
            this.changeLocation();
        }
    }

    async changeLocation(){
        const modal = await this.modalController.create({
            component: LocationPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
    
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.reddah.saveUserLocation(this.userName, data, data.location.lat, data.location.lng);
        }
    }


    async magicMirror(){
        const modal = await this.modalController.create({
            component: MagicMirrorPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }

    async magicMirrorCat(){
        const modal = await this.modalController.create({
            component: MagicMirrorPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }

    async blackHole(){
        const modal = await this.modalController.create({
            component: WormHolePage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }

    async mystic(){
        const modal = await this.modalController.create({
            component: MysticPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        await modal.present();
    }

    async story(){
        const modal = await this.modalController.create({
            component: StoryPage,
            componentProps: {
                //lat: this.config.lat,
                //lng: this.config.lng
            },
            cssClass: "modal-fullscreen",
        });
            
        await modal.present();
    }

    async map(){
        const modal = await this.modalController.create({
            component: MapPage,
            componentProps: {
                //lat: this.config.lat,
                //lng: this.config.lng
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    async goPlatform(){
        const modal = await this.modalController.create({
            component: PlatformPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
    }

    @ViewChild('earthbox') earthbox;
    showBox= false;
    async showEarthBox(){
        //this.showBox = !this.showBox;
    }

    goMoreApp(){
        this.router.navigate(['/search'], {
            queryParams: {
                type:3
            }
        });
    }

    async goMini(mini){
        
        //open mini page
        const modal = await this.modalController.create({
            component: MiniViewerComponent,
            componentProps: { 
                content: mini.Cover,
                guid: mini.UserName,
                //version: mini.Sex,//always use the latest version
                version: this.reddah.appData('usersex_'+mini.UserName)
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data||!data)
        {
            if(data=='report'){
                const modal = await this.modalController.create({
                    component: AddFeedbackPage,
                    componentProps: { 
                        title: this.reddah.instant("Pop.Report"),
                        desc: this.reddah.instant("Pop.ReportReason"),
                        feedbackType: 4,
                        article: mini
                    },
                    cssClass: "modal-fullscreen",
                });
                  
                await modal.present();
            }
            else if(data=='share'){
                const modal = await this.modalController.create({
                    component: ShareChooseChatPage,
                    componentProps: { 
                        title: this.reddah.instant("Common.Choose"),
                        article: mini,
                    },
                    cssClass: "modal-fullscreen",
                });
                  
                await modal.present();        
            }
        }

        this.reddah.setRecent(mini,4);
        this.reddah.setRecentUseMini(mini.UserName).subscribe(data=>{
            this.user_apps = this.reddah.loadRecent(4);
        });
    }
}
