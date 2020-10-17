import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TweenMax } from "gsap";

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{

  constructor(
    private router: Router,
  ) {

  }

  ngOnInit(){
    
  }

  getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
  }

  playBgm = true;
  bgm(){
    this.playBgm = !this.playBgm;
  }
  
  locale(){
    
  }


  

  goClassic(){
    this.router.navigate(['/tabs/tab3'], {
        queryParams: {
            lat: 1,
        }
    });
  }

  goAdventure(){
    this.router.navigate(['/tabs/tablevel'], {
        queryParams: {
        }
    });
  }
}
