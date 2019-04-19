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
export class UserPage {
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

    async viewTimeline(){
      const timelineModal = await this.modalController.create({
        component: TimeLinePage,
        componentProps: { userName: this.userName }
      });
        
      await timelineModal.present();
    }

    async presentActionSheet() {
      const actionSheet = await this.actionSheetController.create({
        header: 'Albums',
        buttons: [{
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            console.log('Delete clicked');
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
  

}
