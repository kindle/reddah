import { Component, OnInit, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController, ActionSheetController  } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TsViewerPage } from '../tsviewer/tsviewer.page';

@Component({
  selector: 'app-message',
  templateUrl: 'message.page.html',
  styleUrls: ['message.page.scss']
})
export class MessagePage implements OnInit {
    
    async close(){
        await this.modalController.dismiss();
    }

    messages;

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        private renderer: Renderer,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private popoverController: PopoverController,
        private photoLibrary: PhotoLibrary,
        private cacheService: CacheService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        public actionSheetController: ActionSheetController,
        ){
        
    }
        
    ngOnInit(){
        this.messages = this.reddah.unReadMessage;
        
        this.reddah.setMessageRead().subscribe(data=>{
            if(data.Success==0){
                this.reddah.unReadMessage = [];
            }
        })
    }

    showAll = false;
    showAllMessage(){
        this.showAll = true;
        this.messages = this.reddah.getAllMessage();
    }

    
    async viewTimeline(articleId){
        let formData = new FormData();
        formData.append("ArticleId", JSON.stringify(articleId));

        this.reddah.getArticleById(formData).subscribe(data=>{
            if(data.Success==0){
                this.goTsViewer(data.Message);
            }
        });
    } 

    async goTsViewer(article){
        const userModal = await this.modalController.create({
            component: TsViewerPage,
            componentProps: { 
                article: article
            }
        });
        
        await userModal.present();
    }

}
