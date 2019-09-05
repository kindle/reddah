import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController, ActionSheetController, Slides } from '@ionic/angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { LocalStorageService } from 'ngx-webstorage';
import 'hammerjs';
import { ReddahService } from '../../reddah.service';
import { CacheService } from 'ionic-cache';
import { TranslateService } from '@ngx-translate/core';
import { Clipboard } from '@ionic-native/clipboard/ngx';

@Component({
    selector: 'app-image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {
    @Input() index = 0;
    @Input() imgSourceArray: any = [];
    enhanceImgSourceArray: any = [];
    @Input() imgTitle = '';
    @Input() imgDescription = '';
    @Input() showDownload = false;

    slideOpts = {};
    private fileTransfer: FileTransferObject; 

    constructor(
        private modalController: ModalController,
        private transfer: FileTransfer, 
        private file: File,
        private localStorageService: LocalStorageService,
        private toastController: ToastController,
        private actionSheetController: ActionSheetController,
        public reddah: ReddahService,
        private cacheService: CacheService,
        public translate: TranslateService,
        private clipboard: Clipboard
    ) {
    }

    //0: web preview url, 1:local preview, 2: on-going, 3: local org, 
    ngOnInit() {
        this.slideOpts = {
            centeredSlides: 'true',
            initialSlide: this.index,
        };

        
    }

    ionViewDidEnter(){
        for(let i=0;i<this.imgSourceArray.length;i++){
            let preview = this.localStorageService.retrieve(this.imgSourceArray[i]);
            let org = this.localStorageService.retrieve(this.imgSourceArray[i].replace("_reddah_preview",""));
            let fileName = this.imgSourceArray[i].replace("///login.reddah.com/uploadPhoto/","");

            if(org){
                let localUrl = (<any>window).Ionic.WebView.convertFileSrc(org);
                this.enhanceImgSourceArray[i] = { 
                    webPreviewUrl: this.imgSourceArray[i],
                    localhostImageUrl: localUrl,
                    localFileImageUrl: org,
                    previewImageFileName: fileName,
                    isOrgViewed: 3, 
                }
            }
            else if(preview){
                let localUrl = (<any>window).Ionic.WebView.convertFileSrc(org);
                this.enhanceImgSourceArray[i] = { 
                    webPreviewUrl: this.imgSourceArray[i], 
                    localhostImageUrl: localUrl,
                    localFileImageUrl: preview,
                    previewImageFileName: fileName,
                    isOrgViewed: 1,
                }
            }else{
                this.enhanceImgSourceArray[i] = { 
                    webPreviewUrl: this.imgSourceArray[i], 
                    localhostImageUrl: '',
                    localFileImageUrl: '',
                    previewImageFileName: fileName,
                    isOrgViewed: 0,
                }
            }

        }

        //if(this.index>=0&&this.index<this.enhanceImgSourceArray.length){
        //    this.downloadOrgImage(this.enhanceImgSourceArray[this.index]);
        //}
    }

    org(src){
        return src.replace("_reddah_preview","")
    }

    singleClickTimer = null;
    async single_click(event){
        window.clearTimeout(this.singleClickTimer)
        this.singleClickTimer =setTimeout(()=> { this.closeModal(event); },300);
    }

    async double_click(){
        window.clearTimeout(this.singleClickTimer);
    }

    async closeModal(event) {
        var target = event.target || event.srcElement || event.currentTarget;
        if(target.id==="downloadOrgImage"||target.id==="downloadImage"){}
        else{
            this.modalController.dismiss();
        }
    }

    async showMenu(item){
        const actionSheet = await this.actionSheetController.create({
            buttons: [
            /*{
                text: this.translate.instant("Pop.ToFriend"),
                icon: 'share',
                handler: () => {
                    
                }
            },*/ 
            {
                text: this.translate.instant("Common.Copy"),
                icon: 'copy',
                handler: () => {
                    let url = item.webPreviewUrl;
                    this.clipboard.copy(url);
                    this.reddah.toast(this.translate.instant("Common.Copy")+url, "primary");
                }
            },
            {
                text: this.translate.instant("Menu.Mark"),
                icon: 'bookmark',
                handler: () => {
                    let formData = new FormData();
                    formData.append("ArticleId", JSON.stringify(-1));
                    let orgurl = this.reddah.appCacheToOrg[item.webPreviewUrl];
                    formData.append("Content", orgurl==null?item.webPreviewUrl:orgurl);
                    
                    this.reddah.addBookmarkFormData(formData);
                }
            }, 
            {
                text: this.translate.instant("Common.Save"),
                icon: 'ios-save',
                handler: () => {
                    this.downloadImage(item);
                }
            }, 
            ]
          });
          await actionSheet.present();
    }

    @ViewChild(Slides) slides: Slides;

    ionSlideWillChange(){
        this.slides.getActiveIndex().then(index=>
        {
            //if(index>=0&&index<this.enhanceImgSourceArray.length){
            //    let item = this.enhanceImgSourceArray[index];
            //    if(item.isOrgViewed==0)
            //        this.downloadOrgImage(item);
            //}
        });
        
    }
    //loadProgress : any;

    async downloadOrgImage(item) {
        //set status as loading
        item.isOrgViewed = 2;
        // only against preview image
        this.fileTransfer = this.transfer.create();  
        //this.fileTransfer.onProgress((data)=>{
        //    this.loadProgress = data.loaded/data.total*100;
        //});
        let orgImageUrl = item.webPreviewUrl.replace("///","https://").replace("_reddah_preview","");
        let orgImageFileName = item.previewImageFileName.replace("_reddah_preview","");
        //this.fileTransfer.download(orgImageUrl, this.file.applicationStorageDirectory + orgImageFileName).then((entry) => {
        this.fileTransfer.download(orgImageUrl, this.file.externalRootDirectory+"reddah/" + orgImageFileName).then((entry) => {
            //let localFileImageUrl = this.file.applicationStorageDirectory + orgImageFileName;
            let localFileImageUrl = this.file.externalRootDirectory + "reddah/" + orgImageFileName;
            this.localStorageService.store(item.webPreviewUrl.replace("_reddah_preview",""), localFileImageUrl);
            //this.reddah.appPhoto[item.webPreviewUrl] = (<any>window).Ionic.WebView.convertFileSrc(localFileImageUrl);
            for(let i=0;i<this.imgSourceArray.length;i++){
                if(this.imgSourceArray[i]===item.webPreviewUrl){
                    let localhostImageUrl = (<any>window).Ionic.WebView.convertFileSrc(localFileImageUrl);
                    this.enhanceImgSourceArray[i].localhostImageUrl = localhostImageUrl;
                    this.enhanceImgSourceArray[i].localFileImageUrl = localFileImageUrl;
                    this.enhanceImgSourceArray[i].isOrgViewed = 3;

                    break;
                }
            }
        }, (error) => {
            //console.log(JSON.stringify(error));
        });        
    }

    async downloadImage(item){
        if(item.isOrgViewed!=1)
        {
            //download preview image
            let source = item.webPreviewUrl.replace("///","https://");
            let target = this.file.externalRootDirectory + "DCIM/Reddah/" + item.previewImageFileName;
            let briefTarget = "DCIM/Reddah/" + item.previewImageFileName;
            this.fileTransfer = this.transfer.create(); 
            const toast = await this.toastController.create({
                message: `${this.translate.instant("Common.Save")}:${briefTarget}`,
                showCloseButton: false,
                position: 'bottom',
                duration: 2500
            });
            this.fileTransfer.download(source, target, true).then((entry) => {
                toast.present();
            }, (error) => {
                alert(JSON.stringify(error));
            });
        }
        else
        {
            //copy from local directory
            let fileName = item.previewImageFileName.replace("_reddah_preview","");
            let path = item.localFileImageUrl.replace(fileName, "");
            let newFileName = fileName;
            let newPath = this.file.externalRootDirectory + "DCIM/Reddah/";
            
            let briefTarget = "DCIM/Reddah/" + newFileName;
            
            const toast = await this.toastController.create({
                message: `${this.translate.instant("Common.Save")}:${briefTarget}`,
                showCloseButton: false,
                position: 'bottom',
                duration: 2500
            });
            
            this.file.copyFile(path, fileName, newPath, newFileName).then((data)=>{
                toast.present();
            });
        }
      
    }
  
}
