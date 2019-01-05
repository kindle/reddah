import { Component, OnInit } from '@angular/core';
import { ReddahService } from '../reddah.service';
import { Article } from '../article';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {

    constructor(private reddah : ReddahService){}

    ngOnInit(){
      this.getHeroes();
    }
  
    articles: Article[];

    getHeroes(): void {
      this.reddah.getHeroes()
        .subscribe(heroes => this.articles = heroes);
    
    }

    view(){
      alert('view article content');
    }

}
