import { Component, OnInit, Input, Renderer2 } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ActionSheetController, NavParams, AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ApplyFriendPage } from '../../friend/apply-friend/apply-friend.page';
import { TimeLinePage } from '../../mytimeline/timeline/timeline.page';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { CacheService } from "ionic-cache";
import { SettingNoteLabelPage } from '../../settings/setting-note-label/setting-note-label.page';
import { ChatFirePage } from '../../chatfire/chat-fire.page';
import { MorePage } from '../more/more.page';
import { LocationPage } from '../location/location.page';
import { MiniViewerComponent } from '../mini-viewer/mini-viewer.component';
import { AddFeedbackPage } from '../../mytimeline/add-feedback/add-feedback.page';
import { ShareChooseChatPage } from '../../chat/share-choose-chat/share-choose-chat.page';

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
        public navController: NavController,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public actionSheetController: ActionSheetController,
        private alertController: AlertController,
    ){}

    isFriend = false;
    
    ngOnInit(){
        this.currentUserName = this.reddah.getCurrentUser();
        this.reddah.getUserPhotos(this.userName);
        this.getTimeline();
        this.getUsedMini();
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
                this.appList.push(mini);
                
                if(this.appList.length>=3)
                    break;
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
        this.reddah.setRecentUseMini(mini.UserName).subscribe(data=>{});
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
        this.appList = [];
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
              text: this.reddah.instant("Common.Refresh"),
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
                    text: this.reddah.instant("Pop.Report"),
                    icon: 'alert',
                    handler: () => {
                        this.report();                  
                    }
                }]:[]
            ).concat(this.reddah.appData('userisfriend_'+this.userName+'_'+this.currentUserName)==1?
            [{
                text: this.reddah.instant("Comment.Delete"),
                icon: 'trash-outline',
                handler: () => {
                    this.delConfirm();                  
                }
            }]:[]
        )
        });
        await actionSheet.present();
    }

    async report(){
        this.close();
        const modal = await this.modalController.create({
            component: AddFeedbackPage,
            componentProps: { 
                title: this.reddah.instant("Pop.Report"),
                desc: this.reddah.instant("Pop.ReportUserReason"),
                feedbackType: 6,
                article: null,
                userName: this.userName
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    async delConfirm(){
        const alert = await this.alertController.create({
          header: this.reddah.instant("Confirm.Title"),
          message: this.reddah.instant("Confirm.DeleteMessage"),
          buttons: [
            {
                text: this.reddah.instant("Confirm.Cancel"),
                cssClass: 'secondary',
                handler: (blah) => {
                    
                }
            }, 
            {
                text: this.reddah.instant("Comment.Delete"),
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
        const chatModal = await this.modalController.create({
            component: ChatFirePage,
            componentProps: { 
                title: this.reddah.appData('usernotename_'+this.userName+'_'+this.currentUserName),
                target: this.userName,
            },
            cssClass: "modal-fullscreen",
        });
        await chatModal.present();
        //const {data} = await modal.onDidDismiss();
    }

    async goMore(){
        const modal = await this.modalController.create({
            component: MorePage,
            componentProps: { target : this.userName},
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
