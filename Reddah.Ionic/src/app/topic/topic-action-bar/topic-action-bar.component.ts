import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { Article } from 'src/app/model/article';
import { PostviewerPage } from 'src/app/postviewer/postviewer.page';
import { AddTimelinePage } from 'src/app/mytimeline/add-timeline/add-timeline.page';

@Component({
    selector: 'app-topic-action-bar',
    templateUrl: './topic-action-bar.component.html',
    styleUrls: ['./topic-action-bar.component.scss']
})
export class TopicActionBarComponent {

    @Input() article;
    @Input() key;
    @Input() articles;

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
    ) { }

    async view(article: Article){
        const viewerModal = await this.modalController.create({
            component: PostviewerPage,
            componentProps: { 
                article: article,
                isTopic: true
            },
            cssClass: "modal-fullscreen",
        });
        
        await viewerModal.present();
        
        const { data } = await viewerModal.onDidDismiss();
        if(data||!data){   
            article.Read = true;
        }
    }

    async forwardArticle(article){
        const postModal = await this.modalController.create({
            component: AddTimelinePage,
            componentProps: { 
                postType: 4,
                title: this.reddah.instant('Article.Forward'),
                article: article
            },
            cssClass: "modal-fullscreen",
        });
          
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            this.reddah.fwdArticle(article);
            this.reddah.getSharePoint();
        }
    }


}
