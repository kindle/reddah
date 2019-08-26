import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { Article } from '../../model/article';
import { PostviewerPage } from '../../postviewer/postviewer.page';

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

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
    ) { }

    async viewArticle(articleId){
        if(this.view){
            let formData = new FormData();
            formData.append("ArticleId", JSON.stringify(articleId));

            this.reddah.getArticleById(formData).subscribe(data=>{
                if(data.Success==0){
                    this.goArticleViewer(data.Message);
                }
            });
        }
    } 

    async goArticleViewer(article: Article){
        const viewerModal = await this.modalController.create({
            component: PostviewerPage,
            componentProps: { article: article }
        });
        
        await viewerModal.present();
        const { data } = await viewerModal.onDidDismiss();
        if(data){
            //console.log(data)
        }

    }

}
