import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../model/article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { PostviewerPage } from '../postviewer/postviewer.page';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import { BookmarkPopPage } from '../common/bookmark-pop.page';
import { ImageViewerComponent } from '../common/image-viewer/image-viewer.component';

@Component({
    selector: 'app-bookmark',
    templateUrl: 'bookmark.page.html',
    styleUrls: ['bookmark.page.scss']
})
export class BookmarkPage implements OnInit {

    bookmarks = [];
    loadedIds = [];

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    @ViewChild('pageTop') pageTop: Content;
    
    userName: any;

    async close(){
        this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        private popoverController: PopoverController,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,

    ){
        this.userName = this.reddah.getCurrentUser();
    }

    async ngOnInit(){
        const loading = await this.loadingController.create({
            message: this.translateService.instant("Article.Loading"),
            spinner: 'circles',
        });
        await loading.present();

        this.bookmarks = [];
        this.loadedIds = [];

        let cacheKey = "this.reddah.getBookmarks" + JSON.stringify(this.loadedIds);
        let formData = new FormData();
        formData.append("loadedIds", JSON.stringify(this.loadedIds));
        let request = this.reddah.getBookmarks(formData);

        this.cacheService.loadFromObservable(cacheKey, request, "BookmarkPage")
        .subscribe(result => 
        {
            console.log(result.Message)
            if(result.Success==0){
                console.log(this.bookmarks);
                for(let bookmark of result.Message){
                    this.bookmarks.push(bookmark);
                    this.loadedIds.push(bookmark.Id);  
                }
            }
            else{
                console.log(result.Message);
            }
            
            loading.dismiss();
        });
    }
  
    getBookmarks(event):void {
        let cacheKey = "this.reddah.getBookmarks" + JSON.stringify(this.loadedIds);
        let formData = new FormData();
        formData.append("loadedIds", JSON.stringify(this.loadedIds));
        let request = this.reddah.getBookmarks(formData);

        this.cacheService.loadFromObservable(cacheKey, request, "BookmarkPage")
        .subscribe(result => 
        {
            console.log(result)
            if(result.Success==0){
                for(let bookmark of result.Message){
                    this.bookmarks.push(bookmark);
                    this.loadedIds.push(bookmark.Id);  
                }
            }
            
            if(event)
                event.target.complete();
        });
    }    

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("BookmarkPage");
        this.getBookmarks(event);
    }

    //drag down
    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    //drag up
    loadData(event) {
        this.getBookmarks(event);
    }
    
    async view(article: Article){
        const viewerModal = await this.modalController.create({
            component: PostviewerPage,
            componentProps: { article: article }
        });
        
        await viewerModal.present();
        const { data } = await viewerModal.onDidDismiss();
        if(data){
            console.log(data)
        }

    }

    async viewer(photo) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
              imgSourceArray: [photo],
              imgTitle: "",
              imgDescription: ""
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true
        });
    
        return await modal.present();
    }

    async createNote(){}

    async showChangeMenu(ev: any, bookmark){
        const popover = await this.popoverController.create({
            component: BookmarkPopPage,
            event: ev,
            cssClass: 'article-pop-popover'
        });

        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data==0)//forward
        {
            
        }
        else if(data==1)//delete
        {
            let formData = new FormData();
            formData.append("Id", JSON.stringify(bookmark.Id));
            this.reddah.deleteBookmark(formData).subscribe(result=>{
                if(result.Success==0){
                    this.cacheService.clearGroup("BookmarkPage");
                    this.loadedIds.forEach((item,index)=>{
                        if(item==bookmark.Id){
                            this.loadedIds.splice(index, 1); 
                        }
                    });
                    this.bookmarks.forEach((item, index)=>{
                        if(item.Id==bookmark.Id)
                            this.bookmarks.splice(index, 1);
                    });
                }
                else {
                    alert(JSON.stringify(result.Message));
                }
            });
        }
        else
        {

        }
    }
}
