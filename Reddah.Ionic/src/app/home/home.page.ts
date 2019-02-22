import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

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
      private localStorageService: LocalStorageService){
        let locale = this.localStorageService.retrieve("Reddah_Locale");
      console.log(locale);
    }

    async ngOnInit(){
      this.articles = [];
      this.loadedIds = [];
      const loading = await this.loadingController.create({
        message: this.translateService.instant("Article.Loading"),
        spinner: 'circles',
      });
      await loading.present();

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
    
    view(){
      alert('view article content');
    }

}
