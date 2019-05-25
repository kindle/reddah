import { Component, OnInit, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController, ActionSheetController, NavParams, AlertController } from '@ionic/angular';
import { LocalePage } from '../locale/locale.page';
import { PostviewerPage } from '../postviewer/postviewer.page';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { TimelinePopPage } from '../article-pop/timeline-pop.page';
import { ApplyFriendPage } from '../apply-friend/apply-friend.page';
import { TimeLinePage } from '../timeline/timeline.page';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { TimelineCommentPopPage } from '../article-pop/timeline-comment-pop.page'
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { IonicImageLoader } from 'ionic-image-loader';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute, Params } from '@angular/router';

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
                    console.log(article);
                    article.Content.split('$$$').forEach((item)=>{
                        if(this.imageList.length<2)  
                            this.imageList.push(item);
                    });
                    
                    if(this.imageList.length>=2)
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
                    console.log('start del fr')
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

}
