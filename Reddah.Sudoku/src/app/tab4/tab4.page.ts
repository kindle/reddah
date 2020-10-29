import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Inject, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import * as $ from 'jquery';
import { ReddahService } from '../reddah.service';
import { Swiper } from 'swiper';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Tab4Page implements OnInit{

    constructor(
      private _renderer2: Renderer2,
      @Inject(DOCUMENT) private _document: Document,
      private router: Router,
      public reddah: ReddahService,
    ) {}

    ngOnInit(){}

    mystars = 0;
    mycoins = 0;

    maxLevelUnlocked = 1;

    ionViewDidEnter(){
        var swiper = new Swiper('.swiper-container', {
            spaceBetween: 0,
            effect: 'fade',
            pagination: {
              el: '.swiper-pagination',
              clickable: true,
            },
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
        });

        
        this.mystars = this.reddah.getAllMyStars();
        this.mycoins = this.reddah.getMyCoins();
        this.maxLevelUnlocked = this.reddah.getMaxLevelUnlocked();
    }

    addScriptByUrl(src){
        let key = this.nonce_str()+"_js";
    
        let s = this._renderer2.createElement('script');
        s.type = "text/javascript";
        s.src = src;
        s.id = key;
        
        this._renderer2.appendChild(
            this._document.body.getElementsByTagName("app-tablevel")[0], s);
      
    }

    nonce_str() {
        return 'xxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 10 | 0, v = r;
            return v.toString(10);
        });
    }


    goLevel(n){
        if(this.maxLevelUnlocked>=n)
        {
          this.router.navigate(['/tabs/tab2'], {
              queryParams: {
                  level: n,
                  page: 0,
              }
          });
        }
    }

    goHome(){
        this.router.navigate(['/tabs/tab1'], {});
    }
}