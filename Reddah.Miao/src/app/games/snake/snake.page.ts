import { Component, OnInit, Input, ViewChild, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'app-snake',
    templateUrl: './snake.page.html',
    styleUrls: ['./snake.page.scss'],
})
export class GameSnakePage  implements OnInit{

    constructor(
      private _renderer2: Renderer2,
      @Inject(DOCUMENT) private _document: Document,
      ) {}
  
      ngOnInit(){
        
      }
  
  
      ionViewDidEnter(){
        this.addScriptByUrl("/assets/game/snake.js");
      }
  
      addScriptByUrl(src){
        let key = this.nonce_str()+"_js";
    
        let s = this._renderer2.createElement('script');
        s.type = "text/javascript";
        s.src = src;
        s.id = key;
        
        this._renderer2.appendChild(
            this._document.body.getElementsByTagName("app-snake")[0], s);
        
      }
  
      nonce_str() {
          return 'xxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random() * 10 | 0, v = r;
              return v.toString(10);
          });
      }




}
