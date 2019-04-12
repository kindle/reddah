import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
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
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { TimelineCommentPopPage } from '../article-pop/timeline-comment-pop.page'
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { IonicImageLoader } from 'ionic-image-loader';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-timeline',
  templateUrl: 'timeline.page.html',
  styleUrls: ['timeline.page.scss']
})
export class TimeLinePage implements OnInit {

    articles = [];
    loadedIds = [];
    formData: FormData;
    showAddComment = false;

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    @ViewChild('newComment') newComment;
    
    htmlDecode(text: string) {
      var temp = document.createElement("div");
        temp.innerHTML = text;
        var output = temp.innerText || temp.textContent;
        temp = null;
        return output;
    }
    subpost(str: string, n: number) {
      var r = /[^\u4e00-\u9fa5]/g;
      if (str.replace(r, "mm").length <= n) { return str; }
      var m = Math.floor(n/2);
      for (var i = m; i < str.length; i++) {
          if (str.substr(0, i).replace(r, "mm").length >= n) {
              return str.substr(0, i) + "...";
          }
      }
      return str;
    }
    summary(str: string, n: number) {
      str = this.htmlDecode(str).replace(/<[^>]+>/g, "");
      return this.subpost(str, n);
    }
    /*trustAsResourceUrl = function (url) {
      return $sce.trustAsResourceUrl(url);
    }*/
    playVideo(id: string) {
        /*let v = $('#video_' + id).get(0);
        if (v.paused) {
            v.play();
        } else {
            v.pause();
        }*/
        alert('play'+id);
    }
    
    loadData(event) {
        this.getTimeline();
        event.target.complete();
    }

    goback(){
        this.navController.goBack(true);
    }

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
      ){
        //let locale = this.localStorageService.retrieve("Reddah_Locale");
        
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            let refresh = params['refresh'];
            
            if(refresh)//refresh after add timeline
            {
                
            }
      });
    }

    async ngOnInit(){
      const loading = await this.loadingController.create({
        message: this.translateService.instant("Article.Loading"),
        spinner: 'circles',
      });
      await loading.present();
      this.formData = new FormData();
      this.formData.append("loadedIds", JSON.stringify(this.loadedIds));

      let cacheKey = "this.reddah.getTimeline";
      console.log(`cacheKey:{0}`,cacheKey);
      let request = this.reddah.getTimeline(this.formData);

      this.cacheService.loadFromObservable(cacheKey, request, "TimeLinePage")
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
      
      let cacheKey = "this.reddah.getTimeline" + this.loadedIds.join(',');
      console.log(`loadmore_cacheKey:{0}`, cacheKey);
      let request = this.reddah.getTimeline(this.formData);
      
      this.cacheService.loadFromObservable(cacheKey, request, "TimeLinePage")
        .subscribe(timeline => 
          {
              //console.log(JSON.stringify(timeline));
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

      this.showAddComment = false;
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

  debug="";

  async post(ev: any) {
      const popover = await this.popoverController.create({
          component: TimelinePopPage,
          event: ev,
          translucent: true
      });
      await popover.present();
      const { data } = await popover.onDidDismiss();
      this.router.navigate(['/post'], {
        queryParams: {
          data: data
        }
      });
  }

  async presentPopover(ev: any, id: any, groupNames: string) {
    let liked = groupNames.split(',').includes(this.reddah.getCurrentUser());
    const popover = await this.popoverController.create({
      component: TimelineCommentPopPage,
      componentProps: { liked: liked },
      event: ev,
      translucent: true
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();
    if(data){
        if(data==1)
        {
            let likeAddFormData = new FormData();
            likeAddFormData.append("action", "add");
            likeAddFormData.append("id", id+"");
            this.reddah.like(likeAddFormData)
              .subscribe(data => 
                {
                    console.log(JSON.stringify(data));
                    this.cacheService.clearGroup("TimeLinePage");
                }
            );
            
            this.renderUiLike(id, "add");
           
        }

        if(data==2)
        {
            let likeRemoveFormData = new FormData();
            likeRemoveFormData.append("action", "remove");
            likeRemoveFormData.append("id", id+"");
            this.reddah.like(likeRemoveFormData)  
              .subscribe(data => 
                {
                    console.log(JSON.stringify(data));
                    this.cacheService.clearGroup("TimeLinePage");
                }
            );
            this.renderUiLike(id, "remove");
        }
        
        if(data==3){
            this.showAddComment = true;
            setTimeout(() => {
              this.newComment.setFocus();
            },150);
        }
    }
  }

  renderUiLike(id: number, action: string){
      this.articles.forEach((item, index, alias)=> {
          if(item.Id==id){
              let currentUser = this.reddah.getCurrentUser();
              if(action=="add"){
                  if(item.GroupName.length==0){
                      item.GroupName = currentUser;
                  }
                  else {
                      item.GroupName += "," + currentUser;
                  }
              }

              if(action=="remove"){
                  if(item.GroupName==currentUser){
                      item.GroupName="";
                  }
                  else {
                      let groupNames = item.GroupName.split(',');
                      groupNames.forEach((gitem, gindex, galias)=>{
                          if(gitem==currentUser){
                              groupNames.splice(gindex, 1);
                          }
                      });
                      item.GroupName = groupNames.join(',');
                  }
              }
              
              return false;
          }
      });
  }

  async viewer(imageSrc) {
      const modal = await this.modalController.create({
        component: ImageViewerComponent,
        componentProps: {
          imgSource: imageSrc,
          imgTitle: "",
          imgDescription: ""
        },
        cssClass: 'modal-fullscreen',
        keyboardClose: true,
        showBackdrop: true
      });
  
      return await modal.present();
  }
 
  showFacePanel = false;
  toggleFacePanel(){
    this.showFacePanel= !this.showFacePanel;
  }
}
