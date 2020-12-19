import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{

  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    private router: Router,
    private modalController: ModalController
    ) {}

  ngOnInit(){
    this.addScriptByUrl("/assets/js/piano.js");
  }

  addScriptByUrl(src){
    let key = this.nonce_str()+"_js";

    let s = this._renderer2.createElement('script');
    s.type = "text/javascript";
    s.src = src;
    s.id = key;
    
    this._renderer2.appendChild(
        this._document.body.getElementsByTagName("app-tab2")[0], s);
    
  }


  nonce_str() {
    return 'xxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 10 | 0, v = r;
        return v.toString(10);
    });
  }
}
