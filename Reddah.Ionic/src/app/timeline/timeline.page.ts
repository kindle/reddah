import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController } from '@ionic/angular';
import { LocalePage } from '../locale/locale.page';
import { PostviewerPage } from '../postviewer/postviewer.page';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-timeline',
  templateUrl: 'timeline.page.html',
  styleUrls: ['timeline.page.scss']
})
export class TimeLinePage implements OnInit {

    articles: Article[];
    loadedIds: Number[];

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
        this.getHeroes();

        console.log('Done');
        event.target.complete();
    }

    constructor(private reddah : ReddahService,
      public loadingController: LoadingController,
      public translateService: TranslateService,
      public navController: NavController,
      private renderer: Renderer,
      public modalController: ModalController,
      private localStorageService: LocalStorageService){
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        console.log(locale);
    }

    async ngOnInit(){
      let locale = this.localStorageService.retrieve("Reddah_Locale");
      if(locale==null){
        let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
        const changeLocaleModal = await this.modalController.create({
        component: LocalePage,
        componentProps: { orgLocale: currentLocale }
        });
        
        await changeLocaleModal.present();
        const { data } = await changeLocaleModal.onDidDismiss();
        if(data){
            console.log(data)
            //this.router.navigateByUrl('/tabs/(home:home)');
            window.location.reload();
        }
      }

      this.articles = [];
      this.loadedIds = [];
      const loading = await this.loadingController.create({
        message: this.translateService.instant("Article.Loading"),
        spinner: 'circles',
      });
      await loading.present();

      
      this.reddah.getHeroes(this.loadedIds, locale, "promoted")
        .subscribe(heroes => 
            {
                for(let article of heroes){
                  this.articles.push(article);
                  this.loadedIds.push(article.Id);  
                }
                loading.dismiss();
            }
        );
    }
  
    getHeroes():void {
      let locale = this.localStorageService.retrieve("Reddah_Locale");
      if(locale==null)
        locale = "en-US"
      this.reddah.getHeroes(this.loadedIds, locale, "promoted")
        .subscribe(heroes => 
            {
                for(let article of heroes){
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
    
    
    async view(article: Article){
      const viewerModal = await this.modalController.create({
        component: PostviewerPage,
        componentProps: { article: article }
      });
      
      await viewerModal.present();
      const { data } = await viewerModal.onDidDismiss();
      if(data){
          console.log(data)
      }

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



}
