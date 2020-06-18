import { Component, Renderer2, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{

  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    public reddah: ReddahService,
    ) {}

  
    ngOnInit(){
        this.addScriptByUrl("/assets/mount/index.js");
        
    }
    
    
    play(count) {
        let audio3 = new Audio();
        let start = 0;
        let times = count;
        
        audio3.src = "/assets/mount/bike.wav"; 
        audio3.addEventListener("ended",()=>{
          start++;
          if(start<times){
              audio3.play();
          }
        });
        audio3.play();
    }
  
    ionViewDidEnter(){
        
    }
  
    ionViewWillLeave(){
    }
  
  
    addScriptByUrl(src){
      let key = this.reddah.nonce_str()+"_js";
  
      let s = this._renderer2.createElement('script');
      s.type = "text/javascript";
      s.src = src;
      s.id = key;
      
      this._renderer2.appendChild(
          this._document.body.getElementsByTagName("app-tab3")[0], s);
    }
}
