import { Component, Input } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { ReddahService } from '../../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { AddFeedbackPage } from 'src/app/mytimeline/add-feedback/add-feedback.page';
import { ArticleDislikePopPage } from 'src/app/common/article-dislike-pop.page';
import { Article } from 'src/app/model/article';
import { PostviewerPage } from 'src/app/postviewer/postviewer.page';
import { AddTimelinePage } from 'src/app/mytimeline/add-timeline/add-timeline.page';

@Component({
    selector: 'app-article-action-bar',
    templateUrl: './article-action-bar.component.html',
    styleUrls: ['./article-action-bar.component.scss']
})
export class ArticleActionBarComponent {

    @Input() article;
    @Input() userName;

    constructor(
        private modalController: ModalController,
        private popoverController: PopoverController,
        public reddah: ReddahService,
        private localStorageService: LocalStorageService,
    ) { }

    async view(article: Article){
        const viewerModal = await this.modalController.create({
            component: PostviewerPage,
            componentProps: { article: article },
            cssClass: "modal-fullscreen",
        });
        
        await viewerModal.present();
        this.localStorageService.store("reddah_articles_"+this.userName, JSON.stringify(this.reddah.articles));
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

    async feedback(article) {
        const modal = await this.modalController.create({
            component: AddFeedbackPage,
            componentProps: { 
                title: this.reddah.instant("Pop.Report"),
                desc: this.reddah.instant("Pop.ReportReason"),
                feedbackType: 4,
                article: article
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data==true)
        {
            this.reddah.articles.forEach((item, index)=>{
                if(item.Id==article.Id)
                    this.reddah.articles.splice(index, 1);
            })
        }
    }

    async dislike(event, article){
        let reasons = [
            [{Id:1, Title:this.reddah.instant("Pop.SawIt"), Key:"" },{Id:2, Title:this.reddah.instant("Pop.Trash"), Key:""}],
        ];
        reasons.push([
            {Id:4, Title:this.reddah.instant("Pop.Porn"), Key:"" },
            {Id:5, Title:`${this.reddah.instant("Pop.NoAuthor")}:${this.reddah.getDisplayName(article.UserName)}`, Key:article.UserName } ]);
        
        let startIndex = 100;
        let group = article.GroupName.split(',');
        let dislikeGroup = [];
        for(let i=0;i<2;i++){
            let last = group.slice(-1).pop();
            if(last)
            {
                group.splice(group.length-1, 1);
                dislikeGroup.unshift({Id:startIndex, Title:`${this.reddah.instant("Pop.Dislike")}:${last}`, Key: last});
                startIndex++;
            }
        }
        reasons.push(dislikeGroup);

        const popover = await this.popoverController.create({
            component: ArticleDislikePopPage,
            componentProps: { Reasons: reasons },
            //event: event,
            translucent: true,
            animated: false,
            //enterAnimation: "am-fade",
            cssClass: 'article-dislike-popover',
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data!=null)
        {
            //UI remove 
            if(data.Id!=-1){
                this.reddah.articles.forEach((item, index)=>{
                    if(item.Id==article.Id)
                        this.reddah.articles.splice(index, 1);
                })
            }
            

            //parameter
            if(data.Id==5){
                this.reddah.dislikeUserNames.push(data.Key);
                this.localStorageService.store("reddah_article_usernames_"+this.userName, JSON.stringify(this.reddah.dislikeUserNames));
                //ui delete
                this.reddah.articles.forEach((item, index)=>{
                    if(item.UserName==article.UserName)
                        this.reddah.articles.splice(index, 1);
                })
            }
            if(data.Id>10){
                this.reddah.dislikeGroups.push(data.Key);
                this.localStorageService.store("reddah_article_groups_"+this.userName, JSON.stringify(this.reddah.dislikeGroups));
                //ui delete
                this.reddah.articles.forEach((item, index)=>{
                    if(item.GroupName.indexOf(data.Key+",")||
                    item.GroupName.indexOf(","+data.Key+",")|| 
                    item.GroupName.indexOf(","+data.Key))
                        this.reddah.articles.splice(index, 1);
                })
            }

            //cache remove
            this.localStorageService.store("reddah_articles_"+this.userName, JSON.stringify(this.reddah.articles));
            
            //sys report
            //further, flink analytics etc.

            if(data.Id==-1)
                this.feedback(article)
        }
        
    }

}
