import { Component, OnInit } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LoadingController, NavController, ActionSheetController  } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TsViewerPage } from '../tsviewer/tsviewer.page';
import { ActivatedRoute } from '@angular/router';
import { PostviewerPage } from 'src/app/postviewer/postviewer.page';

@Component({
  selector: 'app-message',
  templateUrl: 'message.page.html',
  styleUrls: ['message.page.scss']
})
export class MessagePage implements OnInit {
    
    async close(){
        await this.modalController.dismiss();
    }

    type;//0:mytimeline, 1:@, 2:reply in comments,3:like
    title;
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
        this.messages = this.reddah.unReadMessage.filter(m=>m.Type==this.type).sort((a,b)=>b.Id-a.Id);
        
        this.reddah.setMessageRead(this.type).subscribe(data=>{
            if(data.Success==0){
                this.reddah.storeReadMessage(this.type);
            }
        })
    }

    showAll = false;
    showStoredMessage(){
        this.showAll = true;
        this.messages = this.reddah.getStoredMessage(this.type);
    }

    async viewItem(articleId){
        let formData = new FormData();
        formData.append("ArticleId", JSON.stringify(articleId));

        this.reddah.getArticleById(formData).subscribe(data=>{
            if(data.Success==0){
                if(this.type==0)//timeline
                {
                    this.goTsViewer(data.Message);
                }
                else
                {
                    this.goArticleViewer(data.Message);
                }
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
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await userModal.present();
    }

    async goArticleViewer(article){
        this.reddah.reloadLocaleSettings();
        const viewerModal = await this.modalController.create({
            component: PostviewerPage,
            componentProps: { article: article },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await viewerModal.present();
    }

    async clear(){
        this.reddah.clearStoredMessage(this.type);
        this.showStoredMessage();
    }

}
