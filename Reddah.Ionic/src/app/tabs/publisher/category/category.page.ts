import { Component, OnInit, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import { ReddahService } from '../../../reddah.service';
import { LoadingController, NavController, PopoverController, ActionSheetController  } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
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

    constructor(
        private reddah : ReddahService,
        public loadingController: LoadingController,
        public translate: TranslateService,
        public navController: NavController,
        public modalController: ModalController,
        public actionSheetController: ActionSheetController
        ){
        
    }

    ngOnInit(){
        
    }

    async chooseCategory(type){
        if(type==1){
            //subscriber
            //open register sub
            this.registerByType(type, this.translate.instant("Register.TitleSub"));
        }
        else if(type==2){
            //service
        }
        else if(type==3){
            //mini program
            this.registerByType(type, this.translate.instant("Register.TitleMini"));
        }
    }

    async registerByType(type,title){
        const modal = await this.modalController.create({
            component: RegisterSubPage,
            componentProps: { 
                title: title,
                type: type 
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){

        }
        else{
            
        }
    }

}
