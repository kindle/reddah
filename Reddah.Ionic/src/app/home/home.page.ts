import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController } from '@ionic/angular';
import { LocalePage } from '../locale/locale.page';
import { PostviewerPage } from '../postviewer/postviewer.page';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {

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

      public modalController: ModalController,
      private localStorageService: LocalStorageService,
      private cacheService: CacheService,
      ){
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

      let cacheKey = "this.reddah.getHeroes" + JSON.stringify(this.loadedIds) + locale;
      let request = this.reddah.getHeroes(this.loadedIds, locale, "promoted");

      this.cacheService.loadFromObservable(cacheKey, request)
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

      let cacheKey = "this.reddah.getHeroes" + JSON.stringify(this.loadedIds) + locale;
      let request = this.reddah.getHeroes(this.loadedIds, locale, "promoted");

      this.cacheService.loadFromObservable(cacheKey, request)
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

}
