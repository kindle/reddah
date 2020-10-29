import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { LocalePage } from '../locale/locale.page';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page  implements OnInit{

  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    private router: Router,
    private modalController: ModalController,
    private reddahService: ReddahService,
    public reddah: ReddahService,
    ) {}

  ngOnInit(){
    this.addScriptByUrl("/assets/js/starsky.js");
      
  }

  addScriptByUrl(src){
    let key = this.reddah.nonce_str()+"_js";

    let s = this._renderer2.createElement('script');
    s.type = "text/javascript";
    s.src = src;
    s.id = key;
    
    this._renderer2.appendChild(
        this._document.body.getElementsByTagName("app-tab1")[0], s);
    
  }

  ionViewDidEnter(){
    this.playBgm = this.reddah.getBgm();
    if(!this.playBgm){
      (document.getElementById("bgm") as HTMLAudioElement).pause();

    }
  }

  

  playBgm = true;
  bgm(){
    this.playBgm = !this.playBgm;
    this.reddah.setBgm(this.playBgm);
    if(this.playBgm){
      (document.getElementById("bgm") as HTMLAudioElement).play();
    }
    else{ 
      (document.getElementById("bgm") as HTMLAudioElement).pause();
    }
  }
  
  async locale(){
    let currentLocale = this.reddahService.getCurrentLocale();
    const changeLocaleModal = await this.modalController.create({
        component: LocalePage,
        componentProps: { orgLocale: currentLocale },
        cssClass: "modal-fullscreen",
        swipeToClose: true,
        presentingElement: await this.modalController.getTop(),
    });
    
    await changeLocaleModal.present();
    const { data } = await changeLocaleModal.onDidDismiss();
    if(data){
        let currentLocale = this.reddahService.getCurrentLocale();
        this.reddahService.loadTranslate(currentLocale);
    }    
}


  
/*
  goClassic(){
    this.router.navigate(['/tabs/tab3'], {
        queryParams: {
        }
    });
  }*/

  goAdventure(){
      this.router.navigate(['/tabs/tab4'], {
          queryParams: {
          }
      });
  }
}
