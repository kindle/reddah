import { Component, OnInit, Input } from '@angular/core';
import { PopoverController, NavController, LoadingController, ModalController, AlertController } from '@ionic/angular'
import { TimelinePopPage } from '../../../common/timeline-pop.page';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ReddahService } from '../../../reddah.service';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { CacheService } from "ionic-cache";
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer';
import { LocalStorageService } from 'ngx-webstorage';
import { ImageViewerComponent } from '../../../common/image-viewer/image-viewer.component';
import { DragulaService } from 'ng2-dragula';
import { LocationPage } from '../../../common/location/location.page';
import { VideoEditor } from '@ionic-native/video-editor/ngx';
import { PostviewerPage } from '../../../postviewer/postviewer.page';
import { Article } from '../../../model/article';
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
        private videoEditor: VideoEditor,
        private alertController: AlertController,
    ) { 
        
    }


    close(){
        this.modalController.dismiss();
    }

    ngOnInit() {
        
        if(this.article){
            this.title = this.reddahService.htmlDecode(this.article.Title);
            this.content = this.reddahService.htmlDecode(this.article.Content);
            this.abstract = this.reddahService.htmlDecode(this.article.Abstract);
            this.groupName = this.reddahService.htmlDecode(this.article.GroupName);
        }
        else{
            this.reddahService.getArticles([], "en-us", "draft", "", 1, this.targetUserName).subscribe(articles => 
            {
                if(articles.length>=1){
                    let article = articles[0];
                    this.title = this.reddahService.htmlDecode(article.Title);
                    this.content = this.reddahService.htmlDecode(article.Content);
                    this.abstract = this.reddahService.htmlDecode(article.Abstract);
                    this.groupName = this.reddahService.htmlDecode(article.GroupName);
                }
            });
        }
    }
    
    
    

    async save(){
        const loading = await this.loadingController.create({
            message: 'loading...',
            spinner: 'circles',
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
                imgSourceArray: newImageSrcArray,
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
        //open mini page
        const modal = await this.modalController.create({
            component: MiniViewerComponent,
            componentProps: { 
                content: this.article.Content,
                guid: this.article.UserName
            }
        });
        
        await modal.present();
    }

    async publish(){
        const alert = await this.alertController.create({
            header: "",
            message: `确认发布之后，用户将收到此小程序的更新`,
            buttons: [
              {
                text: "稍后发布",
                role: 'cancel',
                cssClass: 'dark',
                handler: () => {
                  
                }
              }, {
                text: "确认发布",
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
                message: 'loading...',
                spinner: 'circles',
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

}