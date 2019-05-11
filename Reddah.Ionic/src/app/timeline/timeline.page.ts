import { Component, OnInit, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController } from '@ionic/angular';
import { LocalePage } from '../locale/locale.page';
import { PostviewerPage } from '../postviewer/postviewer.page';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { TimelinePopPage } from '../article-pop/timeline-pop.page';
import { UserPage } from '../user/user.page';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { TimelineCommentPopPage } from '../article-pop/timeline-comment-pop.page'
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { IonicImageLoader } from 'ionic-image-loader';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TsViewerPage } from '../tsviewer/tsviewer.page'

@Component({
  selector: 'app-timeline',
  templateUrl: 'timeline.page.html',
  styleUrls: ['timeline.page.scss']
})
export class TimeLinePage implements OnInit {
    @Input() userName: string;

    articles = [];
    loadedIds = [];
    formData: FormData;

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    
    loadData(event) {
        this.getTimeline();
        event.target.complete();
    }

    async goback(){
        await this.modalController.dismiss();
    }

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
        ){
    }
    cover: string = "assets/icon/timg.jpg";
    userPhoto: string = "assets/icon/anonymous.png";
    getUserInfo(){
        this.formData = new FormData();
        this.formData.append("targetUser", this.userName);

        this.reddah.getUserInfo(this.formData)
            .subscribe(userInfo => 
            {
                console.log(JSON.stringify(userInfo));
                if(userInfo.Cover!=null)
                    this.cover = userInfo.Cover;
                if(userInfo.Photo!=null)
                    this.userPhoto = userInfo.Photo;
            }
        );
    }
    
    async ngOnInit(){
        this.getUserInfo();
        const loading = await this.loadingController.create({
            message: this.translateService.instant("Article.Loading"),
            spinner: 'circles',
        });
        await loading.present();
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
                    this.articles.push(article);
                    this.loadedIds.push(article.Id);
                }
                loading.dismiss();
            }
        );
    }
  
    getTimeline():void {
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getTimeline" + this.userName + this.loadedIds.join(',');
        console.log(`loadmore_cacheKey:${cacheKey}`);
        let request = this.reddah.getTimeline(this.formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "TimeLinePage"+this.userName)
          .subscribe(timeline => 
            {
                for(let article of timeline){
                    this.articles.push(article);
                    this.loadedIds.push(article.Id);
                }
            }
        );

    }

    ionViewDidLoad() {
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        console.log(locale);
    }


  @ViewChild('headerStart')
  headerStart:ElementRef;
  @ViewChild('headerOnScroll')
  headerOnScroll:ElementRef;
  @ViewChild('timelineCover')
  timelineCover:ElementRef;
  

  onScroll($event) {
      //console.log($event.detail.scrollTop+" "+this.timelineCover.nativeElement.scrollHeight)
      let offset = this.timelineCover.nativeElement.scrollHeight - $event.detail.scrollTop;
      if(offset>=250)
      {
          this.renderer.setElementStyle(this.headerStart.nativeElement, 'visibility', 'visible');
          this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
          this.renderer.setElementStyle(this.headerStart.nativeElement, 'opacity', '8');
      }
      else if(offset<250 && offset>=150)
      {
          console.log('start change'+offset)
          let opacity = (offset-150)/100;
          if(opacity<0) opacity=0;
          this.renderer.setElementStyle(this.headerStart.nativeElement, 'opacity', opacity+'');
          this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
      }
      else if(offset<150 && offset>=0){
          let opacity = (1-(offset-150)/100);
          if(opacity>1) opacity=1;
          this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'opacity', opacity+'');
      }
      else
      {
          this.renderer.setElementStyle(this.headerStart.nativeElement, 'visibility', 'hidden');
          this.renderer.setElementStyle(this.headerOnScroll.nativeElement, 'visibility', 'visible');
      }
  }

  selectedArticleId: number;
  selectedCommentId: number;

  async viewer(index, imageSrcArray) {
      const modal = await this.modalController.create({
        component: ImageViewerComponent,
        componentProps: {
            index: index,
            imgSourceArray: imageSrcArray,
            imgTitle: "",
            imgDescription: ""
        },
        cssClass: 'modal-fullscreen',
        keyboardClose: true,
        showBackdrop: true
      });
  
      return await modal.present();
  }

  async goTsViewer(article){
        const userModal = await this.modalController.create({
            component: TsViewerPage,
            componentProps: { article: article }
        });
        
        await userModal.present();
  }
        
}
