import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../article';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {

    articles: Article[];
    loadedIds: Number[];

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;

    loadData(event) {
      //setTimeout(() => {
        this.getHeroes();

        console.log('Done');
        event.target.complete();
  
        // App logic to determine if all data is loaded
        // and disable the infinite scroll
        //if (data.length == 1000) {
        //  event.target.disabled = true;
        //}
      //}, 500);
    }

    constructor(private reddah : ReddahService){}

    ngOnInit(){
      this.articles = [];
      this.loadedIds = [];
      this.getHeroes();
    }
  
    

    getHeroes(): void {
      this.reddah.getHeroes()
        .subscribe(heroes => 
          {
            for(let article of heroes){
              this.articles.push(article);
              this.loadedIds.push(article.Id);  
            }
          }
          
        );
    
    }

    view(){
      alert('view article content');
    }

}
