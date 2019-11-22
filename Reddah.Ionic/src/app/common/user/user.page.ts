import { Component, OnInit, Renderer, Input } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController, ActionSheetController, NavParams, AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ApplyFriendPage } from '../../friend/apply-friend/apply-friend.page';
import { TimeLinePage } from '../../mytimeline/timeline/timeline.page';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SettingNoteLabelPage } from '../../settings/setting-note-label/setting-note-label.page';
import { ChatFirePage } from '../../chatfire/chat-fire.page';
import { MorePage } from '../more/more.page';
import { LocationPage } from '../location/location.page';

@Component({
    selector: 'app-user',
    templateUrl: 'user.page.html',
    styleUrls: ['user.page.scss']
})
export class UserPage implements OnInit {
    @Input() userName: string;

    currentUserName;
    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        private renderer: Renderer,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private popoverController: PopoverController,
        private photoLibrary: PhotoLibrary,
        private cacheService: CacheService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        public actionSheetController: ActionSheetController,
        private navParams: NavParams,
        private alertController: AlertController,
        private translate: TranslateService,
    ){}

    isFriend = false;
    
    ngOnInit(){
        this.currentUserName = this.reddah.getCurrentUser();
        this.reddah.getUserPhotos(this.userName);
        this.getTimeline();
        this.isFriend = this.reddah.appData('userisfriend_'+this.userName+'_'+this.reddah.getCurrentUser())==1;
    }

    imageList = [];
    appList = [];
    loadedIds = [];
    formData: FormData;

    getTimeline(){
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getTimeline"+this.userName;
        //console.log(`cacheKey:${cacheKey}`);
        let request = this.reddah.getTimeline(this.formData);

        this.cacheService.loadFromObservable(cacheKey, request, "TimeLinePage"+this.userName)
        .subscribe(timeline => 
        {
            for(let article of timeline){
                
                article.Content.split('$$$').forEach((item)=>{
                    if(this.imageList.length<3&&item.length>0)  
                        this.imageList.push(item);
                });
                
                if(this.imageList.length>=3)
                    break;
            }
        });
    }

    getUsedMini(){
        this.formData = new FormData();
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getUsedMini"+this.userName;
        let request = this.reddah.getUsedMini(this.formData);

        this.cacheService.loadFromObservable(cacheKey, request, "UserPage"+this.userName)
        .subscribe(minis => 
        {
            for(let mini of minis){
                
                //article.Content.split('$$$').forEach((item)=>{
                //    if(this.imageList.length<3&&item.length>0)  
                //        this.imageList.push(item);
                //});
                this.appList.push(mini);
                
                if(this.appList.length>=3)
                    break;
            }
        });
    }

    async viewTimeline(){
        const timelineModal = await this.modalController.create({
            component: TimeLinePage,
            componentProps: { userName: this.userName },
            cssClass: "modal-fullscreen",
        });
          
        await timelineModal.present();
    }

    async close(isCloseParent=false){
        await this.modalController.dismiss(isCloseParent);
    }

    clearCacheAndReload(){
        this.cacheService.clearGroup("TimeLinePage"+this.userName);
        this.imageList = [];
        this.loadedIds = [];
        this.ngOnInit();
    }

    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload();
            event.target.complete();
        }, 2000);
    }

    async presentActionSheet() {
        const actionSheet = await this.actionSheetController.create({
            //header: '',
            buttons: [{
              text: this.translate.instant("Common.Refresh"),
              icon: 'refresh',
              handler: () => {
                  this.clearCacheAndReload();
              }
            }, 
            /*{
              text: 'Share',
              icon: 'share',
              handler: () => {
                  //console.log('Share clicked');
              }
            }*/
            ].concat(this.reddah.appData('userisfriend_'+this.userName+'_'+this.currentUserName)==1?
                [{
                    text: this.translate.instant("Comment.Delete"),
                    icon: 'ios-trash',
                    handler: () => {
                        this.delConfirm();                  
                    }
                }]:[]
            )
        });
        await actionSheet.present();
    }

    async delConfirm(){
        const alert = await this.alertController.create({
          header: this.translate.instant("Confirm.Title"),
          message: this.translate.instant("Confirm.DeleteMessage"),
          buttons: [
            {
                text: this.translate.instant("Confirm.Cancel"),
                cssClass: 'secondary',
                handler: (blah) => {
                    
                }
            }, 
            {
                text: this.translate.instant("Comment.Delete"),
                handler: () => {
                    let formData = new FormData();
                    formData.append("targetUser", this.userName);
                    this.reddah.removeFriend(formData).subscribe(data=>{
                        if(data.Success==0)
                            this.localStorageService.store(`userisfriend_${this.userName}_${this.currentUserName}`, 0);
                            //this.reddah.appPhoto[`userisfriend_${this.userName}_${this.currentUserName}`] = 0;
                            this.cacheService.clearGroup("ContactPage");
                            this.cacheService.clearGroup("TimeLinePage"+this.userName);
                            this.modalController.dismiss();
                    });
                }
            }
          ]
        });
    
        await alert.present();
    }

    async addFriend(){
        const applyFriendModal = await this.modalController.create({
            component: ApplyFriendPage,
            componentProps: { targetUserName: this.userName },
            cssClass: "modal-fullscreen",
        });
          
        await applyFriendModal.present();
    }
  
    async viewer(photo) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
              index:0,
              imgSourceArray: this.reddah.preImageArray([photo]),
              imgTitle: "",
              imgDescription: ""
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true
        });
    
        return await modal.present();
    }

    async changeNoteName(){
        const modal = await this.modalController.create({
            component: SettingNoteLabelPage,
            componentProps: { 
                targetUserName: this.userName,
                currentNoteName: this.reddah.appData('usernotename_'+this.userName+'_'+this.currentUserName)
            },
            cssClass: "modal-fullscreen",
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data||!data)
            this.reddah.getUserPhotos(this.userName);
    }

    async chat(){
        const modal = await this.modalController.create({
            //component: ChatPage,
            component: ChatFirePage,
            componentProps: { 
                title: this.reddah.appData('usernotename_'+this.userName+'_'+this.currentUserName),
                target: this.userName,
            },
            cssClass: "modal-fullscreen",
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
    }

    async goMore(){
        const modal = await this.modalController.create({
            component: MorePage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
    }

    async goLocation(){
        if(this.userName!=this.reddah.getCurrentUser()){
            let location = this.reddah.appData('userlocationjson_'+this.userName);
            const modal = await this.modalController.create({
                component: LocationPage,
                componentProps: { location: JSON.parse(location) },
                cssClass: "modal-fullscreen",
            });
        
            await modal.present();
        }
        else{
            this.changeLocation()
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

}
