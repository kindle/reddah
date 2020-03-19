import { Component, OnInit } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LoadingController, NavController, ActionSheetController  } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
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
        public navController: NavController,
        public modalController: ModalController,
        public actionSheetController: ActionSheetController,
        ){
        
    }
        
    ngOnInit(){
        this.messages = this.reddah.unReadMessage;
        
        this.reddah.setMessageRead().subscribe(data=>{
            if(data.Success==0){
                this.reddah.storeReadMessage();
            }
        })
    }

    showAll = false;
    showStoredMessage(){
        this.showAll = true;
        this.messages = this.reddah.getStoredMessage();
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
            },
            cssClass: "modal-fullscreen",
        });
        
        await userModal.present();
    }

    async clear(){
        this.reddah.clearStoredMessage();
    }

}
