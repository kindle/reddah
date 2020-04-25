import { Component, OnInit } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LoadingController, NavController, ActionSheetController  } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TsViewerPage } from '../tsviewer/tsviewer.page';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-message',
  templateUrl: 'message.page.html',
  styleUrls: ['message.page.scss']
})
export class MessagePage implements OnInit {
    
    async close(){
        await this.modalController.dismiss();
    }

    type;//0:mytimeline, 1:pub comments, 2:@,reply in comments
    messages;

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        public modalController: ModalController,
        public actionSheetController: ActionSheetController,
        private router: ActivatedRoute,
        ){
        
        this.type = this.router.snapshot.queryParams["type"];
    }
        
    ngOnInit(){
        this.messages = this.reddah.unReadMessage.filter(m=>m.Type==this.type);
        
        this.reddah.setMessageRead(0).subscribe(data=>{
            if(data.Success==0){
                this.reddah.storeReadMessage(this.type);
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
