import { Component, OnInit, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
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
import { ChatPage } from '../../chat/chat.page';

@Component({
    selector: 'app-user',
    templateUrl: 'user.page.html',
    styleUrls: ['user.page.scss']
})
export class UserPage implements OnInit {
    @Input() userName: string;

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
    ){}

    ngOnInit(){
        this.reddah.getUserPhotos(this.userName);
        this.getTimeline();
    }

    imageList = [];
    loadedIds = [];
    formData: FormData;

    getTimeline(){
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getTimeline"+this.userName;
        console.log(`cacheKey:${cacheKey}`);
        let request = this.reddah.getTimeline(this.formData);

        this.cacheService.loadFromObservable(cacheKey, request, "TimeLinePage"+this.userName)
            .subscribe(timeline => 
            {
                for(let article of timeline){
                    
                    article.Content.split('$$$').forEach((item)=>{
                        if(this.imageList.length<3)  
                            this.imageList.push(item);
                    });
                    
                    if(this.imageList.length>=3)
                        break;
                }
            }
        );
    }

    async viewTimeline(){
        const timelineModal = await this.modalController.create({
            component: TimeLinePage,
            componentProps: { userName: this.userName }
        });
          
        await timelineModal.present();
    }

    async close(isCloseParent=false){
        await this.modalController.dismiss(isCloseParent);
    }

    clearCacheAndReload(){
        this.cacheService.clearGroup("TimeLinePage"+this.userName);
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
              text: '刷新',
              icon: 'refresh',
              handler: () => {
                  this.clearCacheAndReload();
              }
            }, 
            {
              text: 'Share',
              icon: 'share',
              handler: () => {
                  console.log('Share clicked');
              }
            }
            ].concat(this.reddah.appData('userisfriend_'+this.userName)==1?
                [{
                    text: '删除好友',
                    icon: 'ios-trash',
                    handler: () => {
                        this.delCinfirm();                  
                    }
                }]:[]
            )
        });
        await actionSheet.present();
    }

    async delCinfirm(){
        const alert = await this.alertController.create({
          header: '删除确认',
          message: '确定要删除好友吗？',
          buttons: [
            {
                text: '取消',
                cssClass: 'secondary',
                handler: (blah) => {
                    
                }
            }, 
            {
                text: '删除',
                handler: () => {
                    let formData = new FormData();
                    formData.append("targetUser", this.userName);
                    this.reddah.removeFriend(formData).subscribe(data=>{
                        if(data.Success==0)
                            this.localStorageService.store(`userisfriend_${this.userName}`, 0);
                            this.reddah.appPhoto[`userisfriend_${this.userName}`] = 0;
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
            componentProps: { targetUserName: this.userName }
        });
          
        await applyFriendModal.present();
    }
  
    async viewer(photo) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
              imgSourceArray: [photo],
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
                currentNoteName: this.reddah.appData('usernotename_'+this.userName)
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data||!data)
            this.reddah.getUserPhotos(this.userName);
    }

    async chat(){
        const modal = await this.modalController.create({
            component: ChatPage,
            componentProps: { 
                title: this.reddah.appData('usernotename_'+this.userName),
                target: this.userName,
                
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
    }

}