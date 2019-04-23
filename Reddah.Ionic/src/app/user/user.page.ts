import { Component, OnInit, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController, ActionSheetController  } from '@ionic/angular';
import { LocalePage } from '../locale/locale.page';
import { PostviewerPage } from '../postviewer/postviewer.page';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { TimelinePopPage } from '../article-pop/timeline-pop.page';
import { AddFriendPage } from '../add-friend/add-friend.page';
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
    async close(){
        await this.modalController.dismiss();
    }

    @Input() userName: string;

    constructor(private reddah : ReddahService,
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
      ){
        
    }

    ngOnInit(){
      this.getUserInfo();
      this.getTimeline();
    }

    imageList = [];
    loadedIds = [];
    formData: FormData;


    nickName: string;
    sex=-1;
    photo: string;
    location: string;
    signature: string;

    noteName: string;
    isFriend = -1;

    getUserInfo(){
        this.formData = new FormData();
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getUserInfo"+this.userName;
        console.log(`cacheKey:${cacheKey}`);
        let request = this.reddah.getUserInfo(this.formData);

        this.cacheService.loadFromObservable(cacheKey, request, "TimeLinePage"+this.userName)
            .subscribe(userInfo => 
            {
                console.log(JSON.stringify(userInfo));
                this.nickName = userInfo.NickName
                this.sex = userInfo.Sex;
                this.photo = userInfo.Photo;
                this.location = userInfo.Location;
                this.signature = userInfo.Signature;

                this.noteName = userInfo.NoteName;
                this.isFriend = userInfo.IsFriend?1:0;
            }
        );
    }

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

    clearCacheAndReload(){
        this.cacheService.clearGroup("TimeLinePage"+this.userName);
        this.ngOnInit();
    }

    doRefresh(event) {
      console.log('Begin async operation');
  
      setTimeout(() => {
        this.clearCacheAndReload();
        event.target.complete();
      }, 2000);
    }

    async presentActionSheet() {
      const actionSheet = await this.actionSheetController.create({
        header: 'Albums',
        buttons: [{
          text: '刷新',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
              this.clearCacheAndReload();
          }
        }, {
          text: 'Share',
          icon: 'share',
          handler: () => {
            console.log('Share clicked');
          }
        }, {
          text: 'Play (open modal)',
          icon: 'arrow-dropright-circle',
          handler: () => {
            console.log('Play clicked');
          }
        }, {
          text: 'Favorite',
          icon: 'heart',
          handler: () => {
            console.log('Favorite clicked');
          }
        }, {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
      });
      await actionSheet.present();
    }

    async addFriend(){
        const addFriendModal = await this.modalController.create({
          component: AddFriendPage,
          componentProps: { targetUserName: this.userName }
        });
          
        await addFriendModal.present();
    }
  

}
