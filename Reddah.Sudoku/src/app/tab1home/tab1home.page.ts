import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { LocalePage } from '../locale/locale.page';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-tab1home',
  templateUrl: 'tab1home.page.html',
  styleUrls: ['tab1home.page.scss']
})
export class Tab1homePage implements OnInit{

  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    private router: Router,
    private modalController: ModalController,
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
        this._document.body.getElementsByTagName("app-tab1home")[0], s);
    
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
    let currentLocale = this.reddah.getCurrentLocale();
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
        let currentLocale = this.reddah.getCurrentLocale();
        this.reddah.loadTranslate(currentLocale);
    }    
}

showFeauture = true;
  
/*
  goClassic(){
    this.router.navigate(['/tabs/tab4task'], {
        queryParams: {
        }
    });
  }*/

  goAdventure(){
      this.router.navigate(['/tabs/tab2level'], {
          queryParams: {
          }
      });
  }

  goFeedback(){
      this.reddah.goFeedback();
  }

  goTest(){
    this.router.navigate(['/tabs/tab5'], {
        queryParams: {
        }
    });
  }
}
