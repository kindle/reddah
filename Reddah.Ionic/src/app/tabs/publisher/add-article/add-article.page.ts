import { Component, OnInit, Input } from '@angular/core';
import { PopoverController, NavController, LoadingController, ModalController, AlertController } from '@ionic/angular'
import { ReddahService } from '../../../reddah.service';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { CacheService } from "ionic-cache";
import { MaterialPage } from '../../../mytimeline/material/material.page';
import { LocalStorageService } from 'ngx-webstorage';
import { ImageViewerComponent } from '../../../common/image-viewer/image-viewer.component';
import { DragulaService } from 'ng2-dragula';
import { AddMaterialPage } from '../../../mytimeline/add-material/add-material.page';
import { PostviewerPage } from '../../../postviewer/postviewer.page';
import { TranslateService } from '@ngx-translate/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
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
    
    title: string = "";
    content: string = "";
    groupName: string = "";

    
    config = {
        language: this.reddahService.getCurrentLocale(),
        toolbar: [
             
        //"|", "alignment:left", "alignment:center", "alignment:right", "alignment:adjust", 
        "bold", "italic", "blockQuote", "link", 
        "|", "bulletedList", "numberedList", "imageUpload", 'insertTable','mediaEmbed',
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
            uploadUrl: 'https://login.reddah.com/api/photo/upload?jwt='+this.reddahService.getCurrentJwt()
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
        private popoverController: PopoverController,
        private reddahService: ReddahService,
        private navController: NavController,
        private file: File,
        private loadingController: LoadingController,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private cacheService: CacheService,
        private localStorageService: LocalStorageService,
        private modalController: ModalController,
        private dragulaService: DragulaService,
        private translate: TranslateService,
        private alertController: AlertController,
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
            message: this.translate.instant('Article.Loading'),
            spinner: 'circles',
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
            showBackdrop: true
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
        });
        
        await viewerModal.present();

    }

    async publish(){
        const alert = await this.alertController.create({
            header: "",
            message: this.translate.instant('Common.Publish'),
            buttons: [
              {
                text: this.translate.instant('Confirm.Cancel'),
                role: 'cancel',
                cssClass: 'dark',
                handler: () => {
                  
                }
              }, {
                text: this.translate.instant('Confirm.Yes'),
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
                message: this.translate.instant('Article.Loading'),
                spinner: 'circles',
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
        });
          
        await modal.present();
    }
}
