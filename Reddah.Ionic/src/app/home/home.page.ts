import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../article';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {

    articles: Article[];
    loadedIds: Number[];

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    
    htmlDecode(str: string) {
      var s = "";
      if (str.length == 0) return "";
      s = str.replace(/&amp;/g, "&");
      s = s.replace(/&lt;/g, "<");
      s = s.replace(/&gt;/g, ">");
      s = s.replace(/&nbsp;/g, " ");
      s = s.replace(/&#39;/g, "\'");
      s = s.replace(/&quot;/g, "\"");
      s = s.replace(/&#183;/g, "\·");
      s = s.replace(/&middot;/g, "\·");
      
      return s;
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
      //setTimeout(() => {
        this.getHeroes();

        console.log('Done');
        event.target.complete();
  
        // App logic to determine if all data is loaded
        // and disable the infinite scroll
        //if (data.length == 1000) {
        //  event.target.disabled = true;
        //}
      //}, 500);
    }

    constructor(private reddah : ReddahService, 
      private localStorageService: LocalStorageService){}

    ngOnInit(){
      this.articles = [];
      this.loadedIds = [];
      this.getHeroes();
    }
  
    

    getHeroes(): void {
      let locale = this.localStorageService.retrieve("Reddah_Locale");
      if(locale==null)
        locale = "en-us"
      this.reddah.getHeroes(this.loadedIds, locale, "new")
        .subscribe(heroes => 
          {
            for(let article of heroes){
              this.articles.push(article);
              this.loadedIds.push(article.Id);  
            }
          }
          
        );
    
    }

    view(){
      alert('view article content');
    }

}
