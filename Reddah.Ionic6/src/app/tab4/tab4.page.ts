import { Component, Renderer2, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page implements OnInit{

    constructor(
        private _renderer2: Renderer2,
        @Inject(DOCUMENT) private _document: Document,
    ) {}

    ngOnInit(){
        this.addScriptByUrl("/assets/js/prefixfree.min.js");
        this.addScriptByUrl("/assets/running/index.js");
    }

    
    play(count) {
        let start = 0;
        let times = count;
        
        let audio = new Audio();
        
        audio.src = "/assets/running/run.wav"; 
        audio.addEventListener("ended",()=>{
          start++;
          if(start<times){
              audio.play();
          }
        });
        audio.play();
    }

    ionViewDidEnter(){
      this.play(3);
    }
  
    ionViewWillLeave(){
        
    }
  
    addScriptByUrl(src){
        let key = this.nonce_str()+"_js";
    
        let s = this._renderer2.createElement('script');
        s.type = "text/javascript";
        s.src = src;
        s.id = key;
        
        this._renderer2.appendChild(
            this._document.body.getElementsByTagName("app-tab4")[0], s);
    }
  

    nonce_str() {
        return 'xxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 10 | 0, v = r;
            return v.toString(10);
        });
    }
}
