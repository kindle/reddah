import { Component, Renderer2, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss']
})
export class Tab5Page implements OnInit{

    constructor(
        private _renderer2: Renderer2,
        @Inject(DOCUMENT) private _document: Document,
        public reddah: ReddahService,
    ) {}

    ngOnInit(){
        this.addScriptByUrl("/assets/js/prefixfree.min.js");
        this.addScriptByUrl("/assets/running/index.js");
    }

    audio = new Audio();
    play(count) {
        let start = 0;
        let times = count;
        
        
        
        this.audio.src = "/assets/running/run.wav"; 
        this.audio.addEventListener("ended",()=>{
          start++;
          if(start<times){
              this.audio.play();
          }
        });
        this.audio.play();
    }

    ionViewDidEnter(){
      this.play(3);
    }
  
    ionViewWillLeave(){
        this.audio.pause();
    }
  
    addScriptByUrl(src){
        let key = this.nonce_str()+"_js";
    
        let s = this._renderer2.createElement('script');
        s.type = "text/javascript";
        s.src = src;
        s.id = key;
        
        this._renderer2.appendChild(
            this._document.body.getElementsByTagName("app-tab5")[0], s);
    }
  

    nonce_str() {
        return 'xxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 10 | 0, v = r;
            return v.toString(10);
        });
    }
}
