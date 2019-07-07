import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { Article } from '../../model/article';
import { PostviewerPage } from '../../postviewer/postviewer.page';

@Component({
    selector: 'app-share-article',
    templateUrl: './share-article.component.html',
    styleUrls: ['./share-article.component.scss']
})
export class ShareArticleComponent {

    @Input() abstract: string; //article title
    @Input() image: string;  //article image
    @Input() id: number;  //article id

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
    ) { }

    async viewArticle(articleId){
        let formData = new FormData();
        formData.append("ArticleId", JSON.stringify(articleId));

        this.reddah.getArticleById(formData).subscribe(data=>{
            if(data.Success==0){
                this.goArticleViewer(data.Message);
            }
        });
    } 

    async goArticleViewer(article: Article){
        const viewerModal = await this.modalController.create({
            component: PostviewerPage,
            componentProps: { article: article }
        });
        
        await viewerModal.present();
        const { data } = await viewerModal.onDidDismiss();
        if(data){
            console.log(data)
        }

    }

}
