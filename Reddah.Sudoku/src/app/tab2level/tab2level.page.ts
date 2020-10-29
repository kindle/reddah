import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ReddahService } from '../reddah.service';
import { Swiper } from 'swiper';

@Component({
    selector: 'app-tab2level',
    templateUrl: 'tab2level.page.html',
    styleUrls: ['tab2level.page.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class Tab2levelPage implements OnInit{

    constructor(
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

    goLevel(n){
        if(this.maxLevelUnlocked>=n)
        {
          this.router.navigate(['/tabs/tab3list'], {
              queryParams: {
                  level: n,
                  page: 0,
              }
          });
        }
    }

    goHome(){
        this.router.navigate(['/tabs/tab1home'], {});
    }
}