import { Component, OnInit } from '@angular/core';
import { ReddahService } from '../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { CacheService } from 'ionic-cache';
import { ArticleTextPopPage } from '../common/article-text-pop.page';
import { ModalController, PopoverController } from '@ionic/angular';
import { SearchPage } from '../common/search/search.page';
import { UserPage } from '../common/user/user.page';
import { ImageViewerComponent } from '../common/image-viewer/image-viewer.component';
import { AddFeedbackPage } from '../mytimeline/add-feedback/add-feedback.page';
import { VideosPage } from '../videos/videos.page';
import { Router } from '@angular/router';
import { AddTimelinePage } from '../mytimeline/add-timeline/add-timeline.page';
import { TimelinePopPage } from '../common/timeline-pop.page';
import { GameTrainPage } from '../games/train/train.page';
import { GameSnakePage } from '../games/snake/snake.page';
import { GameConnectPage } from '../games/connect/connect.page';
import { GameRememberPage } from '../games/remember/remember.page';
import { GameCubePage } from '../games/cube/cube.page';
import { GameSudoPage } from '../games/sudo/sudo.page';
import { GameSudo2Page } from '../games/sudo2/sudo2.page';

@Component({
  selector: 'app-tabgame',
  templateUrl: 'tabgame.page.html',
  styleUrls: ['tabgame.page.scss']
})
export class TabGamePage implements OnInit {

  userName;
  //article = [500,501,502,503,504,505,506,507];
  constructor(
    public reddah: ReddahService,
    private localStorageService: LocalStorageService,
    private cacheService: CacheService,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private router: Router,
  ) {
  }

  tasks = [
      {
          solution: [8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9],
          display: [8, 0, 1, 5, 6, 7, 0, 0, 0, 2, 3, 0, 0, 0, 0, 5, 6, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 7, 0, 0, 0, 0, 3, 0, 5, 9, 0, 2, 0, 7, 0, 0, 0, 0, 0, 0, 0, 9, 1, 2, 0, 0, 0, 4, 0, 6, 0, 0, 0, 1, 2, 3, 0, 8, 0, 0, 5, 0, 4, 5, 6, 0, 0, 0, 0, 0, 0], 
      },
      {}
    ]

  async close(){
    this.router.navigate(['/tabs/tab1'], {
        queryParams: {
            
        }
    });
  }

  loadedIds = [];
  formData: FormData;
  
  async gameCube(){
    const scanModal = await this.modalController.create({
        component: GameCubePage,
        componentProps: { },
        cssClass: "modal-fullscreen",
        swipeToClose: true,
        presentingElement: await this.modalController.getTop(),
    });
    
    await scanModal.present();
}

async gameRemember(){
const scanModal = await this.modalController.create({
    component: GameRememberPage,
    componentProps: { },
    cssClass: "modal-fullscreen",
    swipeToClose: true,
    presentingElement: await this.modalController.getTop(),
});

await scanModal.present();
}   

async gameSudo(task){
    //window["reddahApi"].Task = task;
    const scanModal = await this.modalController.create({
        component: GameSudoPage,
        componentProps: { },
        cssClass: "modal-fullscreen",
        swipeToClose: true,
        presentingElement: await this.modalController.getTop(),
    });
    
    await scanModal.present();
} 

async gameSudo2(task){
    //window["reddahApi"].Task = task;
    const scanModal = await this.modalController.create({
        component: GameSudo2Page,
        componentProps: { },
        cssClass: "modal-fullscreen",
        swipeToClose: true,
        presentingElement: await this.modalController.getTop(),
    });
    
    await scanModal.present();
} 



async gameConnect(){
const scanModal = await this.modalController.create({
    component: GameConnectPage,
    componentProps: { },
    cssClass: "modal-fullscreen",
    swipeToClose: true,
    presentingElement: await this.modalController.getTop(),
});

await scanModal.present();
}   

async gameSnake(){
const scanModal = await this.modalController.create({
    component: GameSnakePage,
    componentProps: { },
    cssClass: "modal-fullscreen",
    swipeToClose: true,
    presentingElement: await this.modalController.getTop(),
});

await scanModal.present();
} 

async gameTrain(){
const scanModal = await this.modalController.create({
    component: GameTrainPage,
    componentProps: { },
    cssClass: "modal-fullscreen",
    swipeToClose: true,
    presentingElement: await this.modalController.getTop(),
});

await scanModal.present();
} 

  ngOnInit(){
      this.userName = this.reddah.getCurrentUser();
      
      let cachedArticles = this.localStorageService.retrieve("Reddah_findpage_"+this.userName);
      let cachedArticleIds = this.localStorageService.retrieve("Reddah_findpage_ids_"+this.userName);
      let cacheArticleArray = JSON.parse(cachedArticles);
      if(cachedArticles&&cacheArticleArray.length>0){
          let top = 20;
          this.reddah.articles = JSON.parse(cachedArticles).slice(0,top);
          this.reddah.articles.forEach(article=>{
              article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)
          });
          this.loadedIds = JSON.parse(cachedArticleIds).slice(0,top);
          //autofill
          //refer to home, todo
      }
      else{
          this.formData = new FormData();
          this.formData.append("loadedIds", JSON.stringify([]));
          this.formData.append("abstract", this.userName);

          let cacheKey = "this.reddah.getFindPage"+this.userName;
          let request = this.reddah.getCatFindPageTopic(this.formData);

          this.cacheService.loadFromObservable(cacheKey, request, "FindPage")
          .subscribe(timeline => 
          {
              if(cachedArticles!=JSON.stringify(timeline))
              {
                  this.reddah.articles = [];
                  this.loadedIds = [];
                  this.commentData = new Map();

                  for(let article of timeline){

                      article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)

                      this.reddah.articles.push(article);
                      this.loadedIds.push(article.Id);
                      this.reddah.getUserPhotos(article.UserName);
                      if(this.isMini(article.Abstract)){
                        this.reddah.getUserPhotos(article.Abstract);
                      }
                      //cache user image
                      this.reddah.toImageCache(article.UserPhoto, `userphoto_${article.UserName}`);
                      //cache preview image
                      article.Content.split('$$$').forEach((previewImageUrl)=>{
                          this.reddah.toFileCache(previewImageUrl);
                          //this.reddah.toImageCache(previewImageUrl, previewImageUrl);
                      });
                      this.GetCommentsData(article.Id);
                  }

                  this.localStorageService.store("Reddah_findpage_"+this.userName, JSON.stringify(timeline));
                  this.localStorageService.store("Reddah_findpage_ids_"+this.userName, JSON.stringify(this.loadedIds));

              }
              else{
                  for(let article of timeline){
                      this.GetCommentsData(article.Id);
                  }
              }
          });
      }

      
  }

  loadData(event) {
      this.getFindPageTopics(event);
  }

  commentData = new Map();
  authoronly = false;
  async GetCommentsData(articleId: number){
      //console.log(`get ts comments:${articleId}`);
      let cacheKey = "this.reddah.getFindPageComments" + articleId;
      let request = this.reddah.getComments(articleId)

      this.cacheService.loadFromObservable(cacheKey, request, "FindPage")
      .subscribe(data => 
      {
          //console.log('load comments:'+articleId+JSON.stringify(data));
          this.commentData.set(articleId, data);
      });
  }

  async fd_viewer(index, imageSrcArray) {
      const modal = await this.modalController.create({
          component: ImageViewerComponent,
          componentProps: {
              index: index,
              imgSourceArray: this.reddah.preImageArray(imageSrcArray),
              imgTitle: "",
              imgDescription: "",
              showDownload: true,
          },
          cssClass: 'modal-fullscreen',
          keyboardClose: true,
          showBackdrop: true,
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });

      return await modal.present();
  }

  async fd_report(article){
      const modal = await this.modalController.create({
          component: AddFeedbackPage,
          componentProps: { 
              title: this.reddah.instant("Pop.Report"),
              desc: this.reddah.instant("Pop.ReportReason"),
              feedbackType: 4,
              article: article
          },
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
        
      await modal.present();
  }

  getFindPageTopics(event):void {
      this.formData = new FormData();
      this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
      this.formData.append("abstract", this.userName);
      
      let cacheKey = "this.reddah.getFindPage" + this.userName + this.loadedIds.join(',');
      let request = this.reddah.getCatFindPageTopic(this.formData);
      
      this.cacheService.loadFromObservable(cacheKey, request, "FindPage")
      .subscribe(timeline => 
      {
          console.log(timeline);
          for(let article of timeline){
              article.like = (this.localStorageService.retrieve(`Reddah_ArticleLike_${this.userName}_${article.Id}`)!=null)
              this.reddah.articles.push(article);
              this.loadedIds.push(article.Id);
              this.reddah.getUserPhotos(article.UserName);
              if(this.isMini(article.Abstract)){
                this.reddah.getUserPhotos(article.Abstract);
              }
              //cache user image
              this.reddah.toImageCache(article.UserPhoto, `userphoto_${article.UserName}`);
              //cache preview image
              article.Content.split('$$$').forEach((previewImageUrl)=>{
                  this.reddah.toFileCache(previewImageUrl);
              });
              this.GetCommentsData(article.Id);
          }

          this.localStorageService.store("Reddah_findpage_"+this.userName, JSON.stringify(timeline));
          this.localStorageService.store("Reddah_findpage_ids_"+this.userName, JSON.stringify(this.loadedIds));

          if(event){
              event.target.complete();
          }

          //this.loading = false;
      });

  }

  clearCacheAndReload(){
      this.loadedIds = [];
      this.cacheService.clearGroup("FindPage");
      this.loadedIds = [-1];
      this.reddah.articles = [];
      this.localStorageService.clear("Reddah_findpage_"+this.userName);
      this.localStorageService.clear("Reddah_findpage_ids_"+this.userName);
      this.getFindPageTopics(event);
  }

  doRefresh(event) {
      setTimeout(() => {
          this.clearCacheAndReload();
          event.target.complete();
      }, 2000);
  }

  async fullText(text){
      const textModal = await this.modalController.create({
          component: ArticleTextPopPage,
          componentProps: { text: text },
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
        
      await textModal.present();
  }

  private isMini(abstract){
      if(abstract==null)
        return false;
      return abstract.length==32;
  }

  playVideo(id){
      this.reddah.playVideo(id);
  }
  
  async goMiniById(abstract){
      let type=3;//default mini
      if(this.isMini(abstract)){
        type=3;//mini
      }
      else{
        type=0;//article
      }
      let key = this.reddah.getDisplayName(abstract, 100);
      const modal = await this.modalController.create({
          component: SearchPage,
          componentProps: { 
              key: key,
              type: type,//array index not id
          },
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
        
      await modal.present();
  }

  async goUser(userName){
      const userModal = await this.modalController.create({
          component: UserPage,
          componentProps: { 
              userName: userName
          },
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
        
      await userModal.present();
  }

  isMe(userName){
      return userName==this.reddah.getCurrentUser();
  }

  translate(article){
      let app_id = this.reddah.qq_app_id;
      let app_key = this.reddah.qq_app_key;
      let time_stamp = new Date().getTime();
      let nonce_str = this.reddah.nonce_str();

      let params2 = {
          "app_id":app_id,
          "time_stamp":Math.floor(time_stamp/1000),
          "nonce_str":nonce_str,
          "text": this.reddah.summary(article.Title, 200),
          "force":0,
          "candidate_langs":"",
          "sign":""
      }

      params2["sign"] = this.reddah.getReqSign(params2, app_key);
      this.reddah.getQqLanguageDetect(params2, app_key).subscribe(detect=>{
          if(detect.Success==0){
              console.log(detect.Message);
              let detectLan = JSON.parse(detect.Message).data.lang;

              let params3 = {
                  "app_id":app_id,
                  "time_stamp":Math.floor(time_stamp/1000),
                  "nonce_str":nonce_str,
                  "text": this.reddah.summary(article.Title, 200),
                  "source":detectLan,
                  "target":this.reddah.adjustLan(detectLan),
                  "sign":""
              }

              if(params3["source"]!=params3["target"])
              {
                  article.TranslateContent =  "...";
                  article.Translate = true;
                  params3["sign"] = this.reddah.getReqSign(params3, app_key);
                  this.reddah.getQqTextTranslate(params3, app_key).subscribe(data=>{
                      //console.log(data)
                      let response3 = JSON.parse(data.Message)
                      let traslatedAnswer = response3.data.target_text;
                      ///console.log(traslatedAnswer);
                      if(data.Success==0){
                          if(response3.ret!=0)
                          {
                              article.TranslateContent =  this.reddah.instant('FedLogin.FailedMessage');
                          }
                          else{
                              article.TranslateContent =  traslatedAnswer;
                              //article.Title = article.TranslateContent;
                          }
                      }
                  });
              }
          }
      });
  }

    async video(){
        const modal = await this.modalController.create({
            component: VideosPage,
            componentProps: {
                
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
            
        await modal.present();
    }

    async goSearch(key=''){
        const modal = await this.modalController.create({
            component: SearchPage,
            componentProps: { 
                key: key,
                //type: 0,//article only
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    async add(ev: any){
        const popover = await this.popoverController.create({
            component: TimelinePopPage,
            animated: false,
            translucent: true,
            cssClass: 'post-option-popover'
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data==1||data==2||data==3){
            //data=1: take a photo, data=2: lib photo, data=3: lib video
            this.goPost(data);
        }
    }
    
    
    async goPost(postType){
        const postModal = await this.modalController.create({
            component: AddTimelinePage,
            componentProps: { 
                postType: postType,
                action: 'topic',
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
            
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            //this.doRefresh(null);
        }
    }

}
