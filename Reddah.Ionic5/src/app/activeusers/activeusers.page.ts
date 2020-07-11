import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, IonContent } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../model/article';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { PostviewerPage } from '../postviewer/postviewer.page';
import { CacheService } from "ionic-cache";
import { BookmarkPopPage } from '../common/bookmark-pop.page';
import { ImageViewerComponent } from '../common/image-viewer/image-viewer.component';
import { UserPage } from '../common/user/user.page';

@Component({
    selector: 'app-active-users',
    templateUrl: 'activeusers.page.html',
    styleUrls: ['activeusers.page.scss']
})
export class ActiveUsersPage implements OnInit {

    activeUsers = [];
    loadedIds = [];

    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    @ViewChild('pageTop') pageTop: IonContent;
    
    userName: any;

    async close(){
        this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        private popoverController: PopoverController,
        public modalController: ModalController,
        private cacheService: CacheService,

    ){
        this.userName = this.reddah.getCurrentUser();
    }

    async ngOnInit(){
        const loading = await this.loadingController.create({
            message: this.reddah.instant("Article.Loading"),
            spinner: 'circles',
        });
        await loading.present();

        this.activeUsers = [];
        this.loadedIds = [];

        let cacheKey = "this.reddah.getActiveUsers" + JSON.stringify(this.loadedIds);
        let formData = new FormData();
        formData.append("loadedIds", JSON.stringify(this.loadedIds));
        let request = this.reddah.getActiveUsers(formData);

        this.cacheService.loadFromObservable(cacheKey, request, "ActiveUsersPage")
        .subscribe(result => 
        {
            console.log(result.Message)
            if(result.Success==0){
                for(let activeUserName of result.Message){
                    this.activeUsers.push(activeUserName);
                    this.loadedIds.push(activeUserName);  
                }
            }
            else{
                console.log(result.Message);
            }
            
            loading.dismiss();
        });
    }
  
    getActiveUsers(event):void {
        let cacheKey = "this.reddah.getActiveUsers" + JSON.stringify(this.loadedIds);
        let formData = new FormData();
        formData.append("loadedIds", JSON.stringify(this.loadedIds));
        let request = this.reddah.getActiveUsers(formData);

        this.cacheService.loadFromObservable(cacheKey, request, "ActiveUsersPage")
        .subscribe(result => 
        {
            if(result.Success==0){
                for(let activeUserName of result.Message){
                    this.activeUsers.push(activeUserName);
                    this.loadedIds.push(activeUserName);  
                }
            }
            
            if(event)
                event.target.complete();
        });
    }    

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("ActiveUsersPage");
        this.getActiveUsers(event);
    }

    //drag down
    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    //drag up
    loadData(event) {
        this.getActiveUsers(event);
    }
    
    async view(article: Article){
        const viewerModal = await this.modalController.create({
            component: PostviewerPage,
            componentProps: { article: article },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
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
                index:0,
                imgSourceArray: this.reddah.preImageArray([photo]),
                imgTitle: "",
                imgDescription: ""
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
    
        return await modal.present();
    }
    
    async goUser(userName){
        const modal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
    }
}
