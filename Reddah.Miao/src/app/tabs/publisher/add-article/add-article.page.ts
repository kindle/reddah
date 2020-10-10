import { Component, OnInit, Input } from '@angular/core';
import { LoadingController, ModalController, AlertController } from '@ionic/angular'
import { ReddahService } from '../../../reddah.service';
import { CacheService } from "ionic-cache";
import { MaterialPage } from '../../../mytimeline/material/material.page';
import { LocalStorageService } from 'ngx-webstorage';
import { ImageViewerComponent } from '../../../common/image-viewer/image-viewer.component';
import { AddMaterialPage } from '../../../mytimeline/add-material/add-material.page';
import { PostviewerPage } from '../../../postviewer/postviewer.page';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Camera, CameraResultType, CameraSource, CameraPhoto } from '@capacitor/core';
//import * as BalloonEditor from '@ckeditor/ckeditor5-build-balloon';
//import * as InlineEditor from '@ckeditor/ckeditor5-build-inline';

//import Image from '@ckeditor/ckeditor5-image/src/image';
//import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
//import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
//import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
//import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';



@Component({
    selector: 'app-add-article',
    templateUrl: './add-article.page.html',
    styleUrls: ['./add-article.page.scss'],
})
export class AddArticlePage implements OnInit {

    //public Editor = InlineEditor;
    public Editor = ClassicEditor;
    

    @Input() targetUserName;
    @Input() article;
    @Input() action;

    isAdminEdit(){
        return this.action == 'AdminEdit';
    }
    
    title: string = "";
    content: string = "";
    groupName: string = "";

    //"|", "bulletedList", "numberedList", "imageUpload", 'insertTable','mediaEmbed',
    config = {
        language: this.reddahService.getCurrentLocale(),
        toolbar: [
             
        "|", "alignment:left", "alignment:center", "alignment:right", "alignment:adjust", 
        "bold", "italic", "blockQuote", "link", 
        "|", "bulletedList", "numberedList", 'insertTable','mediaEmbed',
        "|", "undo", "redo",
        "|", "heading",],
       /*
        toolbar: [
            'Code','ImageUpload',
            'insertTable',
            'mediaEmbed',
            
            'Bold', 'Italic', 'Strike', 'RemoveFormat', '-', 
            'Undo','Redo','-',

            'Styles', 'Format', '-',
            'Table', 'HorizontalRule', '-',
        
            'NumberedList', 'BulletedList', 'Blockquote', '-', 
            'Link', 'Unlink', 'Anchor', '-', 
            
            
        ],*/
        ckfinder: {
			// eslint-disable-next-line max-len
            //uploadUrl: 'https://cksource.com/weuy2g4ryt278ywiue/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
            uploadUrl: `${this.reddah.domain}/api/photo/upload${this.reddah.cloud}?jwt=${this.reddahService.getCurrentJwt()}`
        },
        image: {
            toolbar: [
                'imageStyle:full',
                'imageStyle:side',
                '|',
                'imageTextAlternative'
            ]
        },
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
    ) { 
        /*ClassicEditor
        .create( document.querySelector( '#editor' ), {
            plugins: [ Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize ],
            image: {
                toolbar: [ 'imageTextAlternative', '|', 'imageStyle:full', 'imageStyle:side' ]
            }
        } )
        .then()
        .catch();*/
        
    }


    close(){
        this.modalController.dismiss();
    }

    ngOnInit() {
        //console.log(this.article)
        if(this.article){
            this.title = this.reddahService.htmlDecode(this.article.Title);
            this.content = this.reddahService.htmlDecode(this.article.Content);
            this.groupName = this.reddahService.htmlDecode(this.article.GroupName);
        }
    }
    
    
    

    async save(){
        const loading = await this.loadingController.create({
            cssClass: 'my-custom-class',
            spinner: null,
            duration: 30000,
            message: `<div class='bar-box'>${this.reddah.getLoadingEffect()}
            <div class='bar-text'>${this.reddah.instant("Article.Loading")}</div>
            </div>`,
            translucent: true,
            backdropDismiss: true
        });
        await loading.present();

        let formData = new FormData();
        formData.append('title', this.title);
        formData.append('content', this.content);
        formData.append('groupName', this.groupName);
        formData.append('targetUserName', this.targetUserName);
        formData.append('locale', this.reddahService.getCurrentLocale());
        if(this.article&&this.article.Id){
            formData.append('id', JSON.stringify(this.article.Id));
        }
        else{
            formData.append('id', JSON.stringify(-1));
        }
        
        this.reddahService.addPubArticle(formData)
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
        const viewerModal = await this.modalController.create({
            component: PostviewerPage,
            componentProps: { 
                article: this.article,
                preview: true
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await viewerModal.present();

    }

    async publish(){
        const alert = await this.alertController.create({
            header: "",
            message: this.reddahService.instant('Common.Publish'),
            buttons: [
              {
                text: this.reddahService.instant('Confirm.Cancel'),
                role: 'cancel',
                cssClass: 'dark',
                handler: () => {
                  
                }
              }, {
                text: this.reddahService.instant('Confirm.Yes'),
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
                duration: 30000,
                message: `<div class='bar-box'>${this.reddah.getLoadingEffect()}
                <div class='bar-text'>${this.reddah.instant("Article.Loading")}</div>
                </div>`,
                translucent: true,
                backdropDismiss: true
            });
            await loading.present();

            let formData = new FormData();
            formData.append('id', JSON.stringify(this.article.Id));
            this.reddahService.publishArticle(formData)
            .subscribe(result => {
                loading.dismiss();
                if(result.Success==0)
                { 
                    //clear draft list cache
                    this.cacheService.clearGroup("SubInfoPage"+this.targetUserName);
                    this.localStorageService.clear("reddah_articles_draft_"+this.targetUserName);
                    this.localStorageService.clear("reddah_article_ids_draft_"+this.targetUserName);

                    //clear publish user page cache
                    this.cacheService.clearGroup("PubPage"+this.targetUserName);
                    this.localStorageService.clear("reddah_articles_"+this.targetUserName);
                    this.localStorageService.clear("reddah_article_ids_"+this.targetUserName);
        
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


    async SelectPhoto(){
        const modal = await this.modalController.create({
            component: MaterialPage,
            componentProps: { 
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
    }

    async AddPhoto(){
        const modal = await this.modalController.create({
            component: AddMaterialPage,
            componentProps: { 
                article: this.article
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await modal.present();
    }

    async addImage(){

        let photos  = [];
        let formData = new FormData();
        this.reddah.fromLibPhoto(photos, formData, false).then(()=>{
            this.reddah.pubAddImage(formData)
            .subscribe(result => {
                if(result.Success==0)
                { 
                    this.content += `<img src=${result.Message}>`;  
                }
                else
                {
                    //alert(result.Message);
                }
            },
            error=>{
                //alert(JSON.stringify(error));
            });
        })   
        
    }

}
