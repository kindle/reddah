import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { from } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { CachingService } from '../services/caching.service';
import { ReddahService } from '../services/reddah.service';
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
    public reddah: ReddahService,
    public text: TextService,
    private cachingService: CachingService, 
    private loadingController: LoadingController
  ) {
    this.apiService.getCurrentUser().then(data=>{
      //this.userName = data.value
    });
    this.apiService.getCurrentJwt().then(data=>{
      this.jwt = data.value
      console.log(this.jwt)
      console.log(this.userName)
      this.loadData(null);
    });
  }

  ngOnInit() {
    
  }

  cards = []

  getFirstImage(link){
    return link.split('$$$')[0];
  }

  loadData(event) {
    this.getFindPageTopics(event);
  }

  loadedIds = [];
  formData: FormData;

  getFindPageTopics(event):void {
    this.formData = new FormData();
    this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
    this.formData.append("abstract", this.userName);
    this.formData.append("jwt", this.jwt);
    console.log(this.jwt)
    
    //let cacheKey = "this.reddah.getFindPage" + this.userName + this.loadedIds.join(',');
    let request = this.apiService.getFindPageTopic(this.formData);
    request.subscribe(data=>{
      console.log(data)
      for(let article of data){
        this.cards.push(article);
        this.loadedIds.push(article.Id);
      }
      console.log(this.cards)
    });
    
    /*
    this.cacheService.loadFromObservable(cacheKey, request, "FindPage")
    .subscribe(timeline => 
    {
        console.log(timeline);
        for(let article of timeline){
            article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)
            this.findPageArticles.push(article);
            this.loadedIds.push(article.Id);
            this.reddah.getUserPhotos(article.UserName);
            //cache user image
            this.reddah.toImageCache(article.UserPhoto, `userphoto_${article.UserName}`);
            //cache preview image
            article.Content.split('$$$').forEach((previewImageUrl)=>{
                this.reddah.toFileCache(previewImageUrl);
            });
            this.GetCommentsData(article.Id);
        }

        //this.localStorageService.store("Reddah_findpage_"+this.userName, JSON.stringify(timeline));
        //this.localStorageService.store("Reddah_findpage_ids_"+this.userName, JSON.stringify(this.loadedIds));

        if(event){
            event.target.complete();
        }

        //this.loading = false;
    });*/

  }




}
