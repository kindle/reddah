import { Component, OnInit, Input } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { Article } from '../article';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { Location } from '@angular/common';
import { AddCommentPage } from '../add-comment/add-comment.page';
import { ReddahService } from '../reddah.service';
import { ArticlePopPage } from '../article-pop/article-pop.page';
import { CacheService } from "ionic-cache";

@Component({
  selector: 'app-postviewer',
  templateUrl: './postviewer.page.html',
  styleUrls: ['./postviewer.page.scss'],
})
export class PostviewerPage implements OnInit {
  @Input() article: Article;
  authoronly=true;
  constructor(public modalController: ModalController,
    private location: Location,
    private reddah : ReddahService,
    private popoverController: PopoverController,
    private cacheService: CacheService,
    ) { }

  commentsData: any;

  ngOnInit() {
    this.loadComments();
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: ArticlePopPage,
      event: ev,
      translucent: true
    });
    return await popover.present();
  }

  loadComments(){
    let cacheKey = "this.reddah.getComments" + this.article.Id;
    let request = this.reddah.getComments(this.article.Id)

    this.cacheService.loadFromObservable(cacheKey, request)
    
      .subscribe(data => 
        {
            this.commentsData = data;
        }
    );
  }

  htmlDecode(text: string) {
    var temp = document.createElement("div");
      temp.innerHTML = text;
      var output = temp.innerText || temp.textContent;
      temp = null;
      //output = output.replace(/src=\"\/uploadPhoto/g, "imageViewer src=\"\/\/\/reddah.com\/uploadPhoto");
      output = output.replace(/\"\/uploadPhoto/g, "\"\/\/\/reddah.com\/uploadPhoto");
      return output;
  }

  async viewer(event){
    var target = event.target || event.srcElement || event.currentTarget;
    if(target.tagName.toUpperCase()==="IMG"){
      //PhotoViewer.show(target.src, 'view photo', options);
      //PhotoViewer.show(target.src);
      const modal = await this.modalController.create({
        component: ImageViewerComponent,
        componentProps: {
          imgSource: target.src,
          imgTitle: "",
          imgDescription: ""
        },
        cssClass: 'modal-fullscreen',
        keyboardClose: true,
        showBackdrop: true
      });
  
      return await modal.present();
    }
  }

  goback(){
      this.location.back();
  }


  private lastScrollTop: number = 0;
  direction: string = "up";

  onScroll($event){
    let currentScrollTop = $event.detail.scrollTop;

    if(currentScrollTop > this.lastScrollTop)
    {
        this.direction = 'down';
    }
    else if(currentScrollTop < this.lastScrollTop)
    {
        this.direction = 'up';
    }
    
    this.lastScrollTop = currentScrollTop;
  }

  async newComment(articleId: number, commentId: number){
    const addCommentModal = await this.modalController.create({
    component: AddCommentPage,
    componentProps: { 
        articleId: articleId,
        commentId: commentId
      }
    });
    
    await addCommentModal.present();
    const { data } = await addCommentModal.onDidDismiss();
    if(data){
      this.loadComments();
    }

  }

  bookmark(){
    alert('bookmark');
  }

  share(){
    alert('share');
  }

  popover(){
    alert('show menu to report, delete.');
  }
}
