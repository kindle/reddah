import { Component, Inject, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  dao = [{id:1},{id:2},{id:3}];
  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
  ) {}


  slideOpts;

  ngOnInit(){

    this.slideOpts = {
        pager: false,
        direction: 'vertical',
        centeredSlides: 'true',
        initialSlide: 0,
        zoom: true,
        spaceBetween: 0,
        effect: 'flip',
    };
    this.addScriptByUrl("/assets/mag.js");
  }

  addScriptByUrl(src){
    let key = this.nonce_str()+"_js";

    let s = this._renderer2.createElement('script');
    s.type = "text/javascript";
    s.src = src;
    s.id = key;
    
    this._renderer2.appendChild(
        this._document.body.getElementsByTagName("app-tab3")[0], s);
    
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

  ionSlideWillChange(){
      this.slides.getActiveIndex().then(index=>
      {
          if(this.lastElement!=null){
              this.lastElement.pause();
              this.lastElement.currentTime = 0;
          }

          
      });

  }


}
