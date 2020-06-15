import { Component, Renderer2, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ReddahService } from '../reddah.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page implements OnInit{

    constructor(
        private _renderer2: Renderer2,
        @Inject(DOCUMENT) private _document: Document,
        private modalController: ModalController,
        public reddah: ReddahService,
        ) {}
    
      ngOnInit(){
        this.addScriptByUrl("/assets/mount/index.js");
          
      }
      
      audio = new Audio();
      play(count) {
          let start = 0;
          let times = count;
          
          this.audio.src = "/assets/mount/bike.wav"; 
          this.audio.addEventListener("ended",()=>{
            start++;
            if(start<times){
                this.audio.play();
            }
          });
          this.audio.play();
      }
    
      ionViewDidEnter(){
        setTimeout(()=>{this.play(1);},2000)
          
      }
    
      ionViewWillLeave(){
          this.audio.pause();
      }
    
    
      addScriptByUrl(src){
        let key = this.reddah.nonce_str()+"_js";
    
        let s = this._renderer2.createElement('script');
        s.type = "text/javascript";
        s.src = src;
        s.id = key;
        
        this._renderer2.appendChild(
            this._document.body.getElementsByTagName("app-tab4")[0], s);
        
      }
    
    }
    
