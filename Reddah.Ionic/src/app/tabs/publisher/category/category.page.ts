import { Component, OnInit, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import { ReddahService } from '../../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController, ActionSheetController  } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { RegisterSubPage } from '../register-sub/register-sub.page';

@Component({
  selector: 'app-category',
  templateUrl: 'category.page.html',
  styleUrls: ['category.page.scss']
})
export class CategoryPage implements OnInit {
    
    async close(){
        await this.modalController.dismiss();
    }

    constructor(private reddah : ReddahService,
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
        
    }

    async chooseCategory(type){
        console.log(type)
        if(type==1){
            //subscriber
            //open register sub
            const modal = await this.modalController.create({
                component: RegisterSubPage
            });
              
            await modal.present();
            const { data } = await modal.onDidDismiss();
            if(data){

            }
            else{
                
            }
        }
        else if(type=2){
            //service
        }
        else if(type=3){
            //mini program
        }
    }

}
