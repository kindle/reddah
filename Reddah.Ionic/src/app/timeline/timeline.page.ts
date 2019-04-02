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

@Component({
  selector: 'app-timeline',
  templateUrl: 'timeline.page.html',
  styleUrls: ['timeline.page.scss']
})
export class TimeLinePage implements OnInit {

    articles = [];
    loadedIds = [];
    formData = new FormData();

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    
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

    constructor(private reddah : ReddahService,
      public loadingController: LoadingController,
      public translateService: TranslateService,
      public navController: NavController,
      private renderer: Renderer,
      public modalController: ModalController,
      private localStorageService: LocalStorageService,
      private popoverController: PopoverController,
      private photoLibrary: PhotoLibrary,
      ){
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        console.log(locale);
    }

    async ngOnInit(){
      const loading = await this.loadingController.create({
        message: this.translateService.instant("Article.Loading"),
        spinner: 'circles',
      });
      await loading.present();

      this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
      this.reddah.getTimeline(this.formData)
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
      this.formData.append("loadedIds", this.loadedIds.join(','));
      this.reddah.getTimeline(this.formData)
        .subscribe(timeline => 
            {
                this.debug += JSON.stringify(timeline);
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



  debug="";

  async post(ev: any) {
      const popover = await this.popoverController.create({
          component: TimelinePopPage,
          event: ev,
          translucent: true
      });
      await popover.present();
      const { data } = await popover.onDidDismiss();
      if(data==1)//photo
      {
          alert('take a photo');
          this.navController.navigateRoot('/post');
          
      }
      else//from library
      {
          this.photoLibrary.requestAuthorization().then(() => {
            this.photoLibrary.getLibrary().subscribe({
              next: library => {
                library.forEach(function(libraryItem) {
                  this.debug += libraryItem.photoURL;
                  console.log(libraryItem.id);          // ID of the photo
                  console.log(libraryItem.photoURL);    // Cross-platform access to photo
                  console.log(libraryItem.thumbnailURL);// Cross-platform access to thumbnail
                  console.log(libraryItem.fileName);
                  console.log(libraryItem.width);
                  console.log(libraryItem.height);
                  console.log(libraryItem.creationDate);
                  console.log(libraryItem.latitude);
                  console.log(libraryItem.longitude);
                  console.log(libraryItem.albumIds);    // array of ids of appropriate AlbumItem, only of includeAlbumsData was used
                });
              },
              error: err => { this.debug += err; console.log('could not get photos'); },
              complete: () => { this.debug += "done"; console.log('done getting photos'); }
            });
          })
          .catch(err => {this.debug += err; console.log('permissions weren\'t granted')});
      }
  }


}
