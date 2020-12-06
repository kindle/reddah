import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { ReddahService } from '../reddah.service';
//import { Draggable } from 'gsap';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  constructor(
    public reddah: ReddahService,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
  ) {}
  
  ngOnInit() {
    
    //this.addScriptByUrl("/assets/knob.js");
  }

  ionViewDidEnter(){

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


}
