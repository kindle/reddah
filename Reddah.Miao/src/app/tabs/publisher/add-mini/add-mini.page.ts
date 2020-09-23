import { Component, OnInit, Input } from '@angular/core';
import { LoadingController, ModalController, AlertController } from '@ionic/angular'
import { ReddahService } from '../../../reddah.service';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { ImageViewerComponent } from '../../../common/image-viewer/image-viewer.component';
import { MiniViewerComponent } from '../../../common/mini-viewer/mini-viewer.component';

@Component({
    selector: 'app-add-mini',
    templateUrl: './add-mini.page.html',
    styleUrls: ['./add-mini.page.scss'],
})
export class AddMiniPage implements OnInit {

    @Input() targetUserName;
    @Input() article;
    
    title: string = "";//js
    content: string = "";//html
    abstract: string = "";//css
    groupName: string = "";

    config = {
        language: this.reddahService.getCurrentLocale(),
        //uiColor: '#9AB8F3',
        toolbar_Reddah: [[
            'Bold', 'Italic', 'Strike', 'RemoveFormat', '-', 
            'Undo','Redo','-',

            'Styles', 'Format', '-',
            'Table', 'Image', 'HorizontalRule', '-',
        
            'NumberedList', 'BulletedList', 'Blockquote', '-', 
            'Link', 'Unlink', 'Anchor', '-', 
            
            'Source'
        ]],

        toolbar: 'Reddah',

        
        //filebrowserBrowseUrl: '&&&&&',
        //filebrowserUploadUrl: '&&&'
    };
    
    
    
    constructor(
        public reddahService: ReddahService,
        private loadingController: LoadingController,
        private cacheService: CacheService,
        private localStorageService: LocalStorageService,
        private modalController: ModalController,
        private alertController: AlertController,
        public reddah: ReddahService,
    ) {}


    close(){
        this.modalController.dismiss();
    }

    loading = true;
    GetLoading(text){
        return this.loading?`${text} ${this.reddahService.instant('Button.Loading')}`:text;
    }

    async ngOnInit() {
        
        const loadingCtrl = await this.loadingController.create({
            cssClass: 'custom-loading',
            spinner:"bubbles",
            duration: 30*1000,
        });
        await loadingCtrl.present();

        if(this.article){
            this.title = this.reddahService.htmlDecode(this.article.Title);
            this.content = this.reddahService.htmlDecode(this.article.Content);
            this.abstract = this.reddahService.htmlDecode(this.article.Abstract);
            this.groupName = this.reddahService.htmlDecode(this.article.GroupName);
            this.loading = false;
            loadingCtrl.dismiss();
        }
        else{
            this.reddahService.getArticles([],[],[], "en-us", "draft", "", 1, this.targetUserName)
            .subscribe(articles => 
            {
                if(articles.length>=1){
                    let article = articles[0];
                    this.title = this.reddahService.htmlDecode(article.Title);
                    this.content = this.reddahService.htmlDecode(article.Content);
                    this.abstract = this.reddahService.htmlDecode(article.Abstract);
                    this.groupName = this.reddahService.htmlDecode(article.GroupName);
                }
                this.loading = false;
                loadingCtrl.dismiss();
            });
        }
    }
    
    
    

    async save(){
        const loading = await this.loadingController.create({
            cssClass: 'my-custom-class',
            spinner: null,
            duration: 5000,
            message: `<div class='bar-box'>${this.reddah.getLoadingEffect()}
            <div class='bar-text'>${this.reddah.instant("Article.Loading")}</div>
            </div>`,
            translucent: true,
            backdropDismiss: true
        });
        await loading.present();

        let formData = new FormData();
        formData.append('title', this.title);//js
        formData.append('content', this.content);//html
        formData.append('abstract', this.abstract);//css
        formData.append('groupName', this.groupName);
        formData.append('targetUserName', this.targetUserName);
        formData.append('locale', this.reddahService.getCurrentLocale());
        if(this.article&&this.article.Id){
            formData.append('id', JSON.stringify(this.article.Id));
        }
        else{
            formData.append('id', JSON.stringify(-1));
        }
        
        this.reddahService.addPubMini(formData)
        .subscribe(result => {
            loading.dismiss();
            if(result.Success==0)
            { 
                this.cacheService.clearGroup("SubInfoPage"+this.targetUserName);
                this.localStorageService.clear("reddah_articles_draft_"+this.targetUserName);
                this.localStorageService.clear("reddah_article_ids_draft_"+this.targetUserName);
                this.modalController.dismiss(true);
            }
            else
            {
                alert(result.Message);
            }
        },
        error=>{
            alert(JSON.stringify(error));
        });
    }

    

    async viewer(index, imageSrcArray) {
        let newImageSrcArray = [];
        imageSrcArray.forEach((item)=>{
            newImageSrcArray.push(item.webUrl);
        });
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
                index: index,
                imgSourceArray: this.reddahService.preImageArray(newImageSrcArray),
                imgTitle: "",
                imgDescription: ""
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
    
        return await modal.present();
    }

    async preview(){
        //open mini page
        const modal = await this.modalController.create({
            component: MiniViewerComponent,
            componentProps: { 
                mini: this.article,
                content: this.article.Content,
                guid: this.article.UserName,
                version: this.article.Id
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await modal.present();
    }

    async publish(){
        const alert = await this.alertController.create({
            header: "",
            message: this.reddahService.instant("Common.MiniPubMsg"),
            buttons: [
              {
                text: this.reddahService.instant("Common.CancelPublish"),
                role: 'cancel',
                cssClass: 'dark',
                handler: () => {
                  
                }
              }, {
                text: this.reddahService.instant("Common.ConfirmPublish"),
                cssClass:'danger',
                handler: () => {
                    this.actualPublish();
                }
              }
            ]
        });

        await alert.present().then(()=>{
            
        });
    }

    async actualPublish(){
        //change flag
        if(this.article){
            const loading = await this.loadingController.create({
                cssClass: 'my-custom-class',
                spinner: null,
                duration: 5000,
                message: `<div class='bar-box'>${this.reddah.getLoadingEffect()}
                <div class='bar-text'>${this.reddah.instant("Article.Loading")}</div>
                </div>`,
                translucent: true,
                backdropDismiss: true
            });
            await loading.present();

            let formData = new FormData();
            formData.append('id', JSON.stringify(this.article.Id));
            
            this.reddahService.publishMini(formData)
            .subscribe(result => {
                loading.dismiss();
                if(result.Success==0)
                { 
                    //clear draft list cache
                    this.cacheService.clearGroup("SubInfoPage"+this.targetUserName);
                    this.localStorageService.clear("reddah_articles_draft_"+this.targetUserName);
                    this.localStorageService.clear("reddah_article_ids_draft_"+this.targetUserName);

                    this.modalController.dismiss(true);
                }
                else
                {
                    alert(result.Message);
                }
            },
            error=>{
                alert(JSON.stringify(error));
            });
        }
        
        //send message to subscribers
    }

    showTabName = 'html';
    change(tabName){
        this.showTabName = tabName;
    }

}
