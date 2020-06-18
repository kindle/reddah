import { Component, Renderer2, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ReddahService } from '../reddah.service';
import { ModalController } from '@ionic/angular';
import { SettingListPage } from '../settings/setting-list/setting-list.page';
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../auth.service';

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
        private localStorageService: LocalStorageService,
        private authService: AuthService,
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
  
      async goSettings(){
          let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
          const modal = await this.modalController.create({
              component: SettingListPage,
              componentProps: {currentLocale:currentLocale},
              cssClass: "modal-fullscreen",
          });
          
          await modal.present();
          const { data } = await modal.onDidDismiss();
          if(data){
              this.authService.logout();
          }
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
    
