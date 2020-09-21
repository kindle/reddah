import { Component, OnInit } from '@angular/core';
import { ReddahService } from '../../../reddah.service';
import { LoadingController, NavController, ActionSheetController  } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
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
        public reddah : ReddahService,
        public loadingController: LoadingController,
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
            this.registerByType(type, this.reddah.instant("Register.TitleSub"));
        }
        else if(type==2){
            //service
        }
        else if(type==3){
            //mini program
            this.registerByType(type, this.reddah.instant("Register.TitleMini"));
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
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){

        }
        else{
            
        }
    }

}
