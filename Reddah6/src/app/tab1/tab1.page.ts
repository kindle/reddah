import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { from } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { CachingService } from '../services/caching.service';
import { I18nService } from '../services/i18n.service';
import { TextService } from '../services/text.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  userName = 'wind';
  jwt;

  constructor(
    private apiService: ApiService,
    public i18n: I18nService,
    public text: TextService,
    private cachingService: CachingService, 
    private loadingController: LoadingController
  ) {
    this.apiService.getCurrentUser().then(data=>{
      //this.userName = data.value
    });
    this.apiService.getCurrentJwt().then(data=>{
      this.jwt = data.value
      this.loadData(null);
    });
  }

  ngOnInit() {
    
  }

  cards = []



  doRefresh(event) {
      setTimeout(() => {
        this.loadedIds = [];
        this.loadedIds = [-1];
        this.cards = [];
        this.loadData(event, true);
          event.target.complete();
      }, 1000);
  }

  loadData(event, forceRefresh = true) {
    this.formData = new FormData();
    this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
    this.formData.append("abstract", this.userName);
    this.formData.append("jwt", this.jwt);
    
    const cacheKey = this.userName + this.loadedIds.join(',');

    if(this.loadedIds.length==0)
    {
      //ok to get json file from azure;
      this.apiService.getCachedJsonFromAzure().then(data=>{
        if(data){
          console.log("bailin test azuree string")
          console.log(data);
          console.log("bailin test azuree json")
          const articles = JSON.parse(data+"");
          
          console.log(data);
          for(let article of articles){
            this.cards.push(article);
            this.loadedIds.push(article.Id);
          }
          console.log(this.cards)
        }
      })
    }

    
    //forceRefresh = true;
    this.apiService.getFindPageTopic(this.formData, cacheKey, forceRefresh)
    .pipe(
        finalize(() => {        
          if (event) {
            event.target.complete();
          }
          //loading.dismiss();
    }))
    .subscribe(data=>{
      console.log('get jsoon11111...')
      console.log(data)
      if(data){
        for(let article of data){
          this.cards.push(article);
          this.loadedIds.push(article.Id);
        }
        console.log(this.cards)
      }
      else{
      }
    });
    

    
  }
  

  loadedIds = [];
  formData: FormData;





}
