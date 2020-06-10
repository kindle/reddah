import { Component, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
//import * as $ from 'jquery';
declare var $:any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    ) {}

  ngOnInit(){
    //this.addScriptByUrl("/assets/running/jquery.js");
    //this.addScriptByUrl("/assets/running/jquery.transform.js");
    //this.addScriptByUrl("/assets/running/prefixfree.min.js");
    this.addScriptByUrl("/assets/running/index.js");
    
  }

  guid = 123;
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