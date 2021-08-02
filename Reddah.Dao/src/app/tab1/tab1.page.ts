import { Component, Inject, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { IonSlides } from '@ionic/angular';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  
  dao = [];
  isMute = null;
  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
  ) {
    let isMute = this.localStorageService.retrieve("Reddah_ismute");
    if(isMute==null)
      isMute = false;
    this.isMute =  isMute;
  }

  toggleMute(){
    if(this.isMute==null)
      this.isMute = false;
    this.isMute = !this.isMute;
    this.localStorageService.store("Reddah_ismute", this.isMute);

    if(this.isMute){
      
    }
  }

  slideOpts;

  ngOnInit(){
    this.dao = [];
    for(var i=22;i>=1;i--){
      this.dao.push({id:i});
    }

  this.slideOpts = {
        pager: true,
        direction: 'horizontal',
        centeredSlides: 'true',
        initialSlide: this.dao.length-1,
        zoom: true,
        effect: 'flip',
        slidesPerView: 2,
        spaceBetween: 0,

    };
    //this.addScriptByUrl("/assets/mag.js");
  }

  addScriptByUrl(src){
    let key = this.nonce_str()+"_js";

    let s = this._renderer2.createElement('script');
    s.type = "text/javascript";
    s.src = src;
    s.id = key;
    
    this._renderer2.appendChild(
        this._document.body.getElementsByTagName("app-tab1")[0], s);
    
  }

  nonce_str() {
      return 'xxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 10 | 0, v = r;
          return v.toString(10);
      });
  }

  @ViewChild(IonSlides) slides: IonSlides;
  lastElement;
  
  ionSlidesDidLoad(){
      
  }

  audio = new Audio();
  ionSlideWillChange(){
      this.slides.getActiveIndex().then(slideIndex=>
      {
          var daoIndex = this.dao.length - slideIndex;
          this.currentChapter = daoIndex;
          console.log(daoIndex);
          this.audio.src = `/assets/zmf/mp3/${daoIndex}.mp3`; 
          this.audio.play();

      });

  }

  currentChapter = 0;
  goTab2(){
    this.router.navigate(['/tabs/tab2'], {
        queryParams: {
            chapter: this.currentChapter,
        }
  });
  }

}
