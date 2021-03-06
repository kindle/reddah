import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { Article } from '../../model/article';
import { PostviewerPage } from '../../postviewer/postviewer.page';
import { AddFeedbackPage } from '../../mytimeline/add-feedback/add-feedback.page';
import { ShareChooseChatPage } from '../../chat/share-choose-chat/share-choose-chat.page';
import { MiniViewerComponent } from '../mini-viewer/mini-viewer.component';

@Component({
    selector: 'app-share-article-chat',
    templateUrl: './share-article-chat.component.html',
    styleUrls: ['./share-article-chat.component.scss']
})
export class ShareArticleChatComponent {

    @Input() abstract: string; //article title
    @Input() image: string;  //article image
    @Input() id: number;  //article id
    @Input() view=true; //default true click to view article
    @Input() type;

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
    ) { }

    async viewArticle(){
        if(this.view){
            let formData = new FormData();
            formData.append("ArticleId", this.id+"");

            this.reddah.getArticleById(formData).subscribe(data=>{
                if(data.Success==0){
                    this.goArticleViewer(data.Message);
                }
                else{
                    alert(JSON.stringify(data))
                }
            });
        }
    } 

    async goArticleViewer(article: Article){
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
            //console.log(data)
        }

    }

    async viewMini(){
        if(this.view){
            let formData = new FormData();
            formData.append("Id", this.id+"");

            this.reddah.getUserById(formData).subscribe(data=>{
                if(data.Success==0){
                    this.goMini(data.Message);
                }
                else{
                    alert(JSON.stringify(data))
                }
            });
        }
    } 

    async goMini(mini){
        
        //open mini page
        const modal = await this.modalController.create({
            component: MiniViewerComponent,
            componentProps: { 
                mini: mini,
                content: mini.Cover,
                guid: mini.UserName,
                //version: mini.Sex,//always use the latest version
                version: this.reddah.appData('usersex_'+mini.UserName)
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data||!data)
        {
            if(data=='report'){
                const modal = await this.modalController.create({
                    component: AddFeedbackPage,
                    componentProps: { 
                        title: this.reddah.instant("Pop.Report"),
                        desc: this.reddah.instant("Pop.ReportReason"),
                        feedbackType: 4,
                        article: mini
                    },
                    cssClass: "modal-fullscreen",
                    swipeToClose: true,
                    presentingElement: await this.modalController.getTop(),
                });
                  
                await modal.present();
            }
            else if(data=='share'){
                const modal = await this.modalController.create({
                    component: ShareChooseChatPage,
                    componentProps: { 
                        title: this.reddah.instant("Common.Choose"),
                        article: mini,
                    },
                    cssClass: "modal-fullscreen",
                    swipeToClose: true,
                    presentingElement: await this.modalController.getTop(),
                });
                  
                await modal.present();        
            }
        }

        this.reddah.setRecent(mini,4);
        this.reddah.setRecentUseMini(mini.UserName).subscribe(data=>{});
    }

}
