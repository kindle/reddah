import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController, ActionSheetController } from '@ionic/angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { LocalStorageService } from 'ngx-webstorage';
import 'hammerjs';

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
    ) {
    }

    //isOrgViewed 0 No, 1 Yes, 2 on-going.
    ngOnInit() {
        this.slideOpts = {
            centeredSlides: 'true',
            initialSlide: this.index,
        };

        for(let i=0;i<this.imgSourceArray.length;i++){
            let org = this.localStorageService.retrieve(this.imgSourceArray[i]);
            let fileName = this.imgSourceArray[i].replace("///login.reddah.com/uploadPhoto/","");
            if(org==null){
                //preview image url
                this.enhanceImgSourceArray[i] = { 
                    webPreviewUrl: this.imgSourceArray[i], 
                    localhostOrgImageUrl: '',
                    localFileOrgImageUrl: '',
                    previewImageFileName: fileName,
                    isOrgViewed: 0,
                }
            }
            else{
                //cached local image file 
                let webUrl = (<any>window).Ionic.WebView.convertFileSrc(org);
                this.enhanceImgSourceArray[i] = { 
                    webPreviewUrl: this.imgSourceArray[i],
                    localhostOrgImageUrl: webUrl,
                    localFileOrgImageUrl: org,
                    previewImageFileName: fileName,
                    isOrgViewed: 1, 
                }
            }
        }
    }

    org(src){
        return src.replace("_reddah_preview","")
    }

    closeModal(event) {
        var target = event.target || event.srcElement || event.currentTarget;
        if(target.id==="downloadOrgImage"||target.id==="downloadImage"){}
        else{
            this.modalController.dismiss();
        }
    }

    async showMenu(item){
        const actionSheet = await this.actionSheetController.create({
            buttons: [
            {
              text: '发送给朋友',
              icon: 'share',
              handler: () => {
                  
              }
            }, 
            {
              text: '收藏',
              icon: 'bookmark',
              handler: () => {
                
              }
            }, 
            {
              text: '保存图片',
              icon: 'ios-save',
              handler: () => {
                  this.downloadImage(item);
              }
            }, 
            ]
          });
          await actionSheet.present();
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
        this.fileTransfer.download(orgImageUrl, this.file.applicationStorageDirectory + orgImageFileName).then((entry) => {
            let localFileOrgImageUrl = this.file.applicationStorageDirectory + orgImageFileName;
            this.localStorageService.store(item.webPreviewUrl, localFileOrgImageUrl);
            for(let i=0;i<this.imgSourceArray.length;i++){
                if(this.imgSourceArray[i]===item.webPreviewUrl){
                    let localhostOrgImageUrl = (<any>window).Ionic.WebView.convertFileSrc(localFileOrgImageUrl);
                    this.enhanceImgSourceArray[i].localhostOrgImageUrl = localhostOrgImageUrl;
                    this.enhanceImgSourceArray[i].localFileOrgImageUrl = localFileOrgImageUrl;
                    this.enhanceImgSourceArray[i].isOrgViewed = 1;

                    break;
                }
            }
        }, (error) => {
            console.log(JSON.stringify(error));
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
                message: `图片已保存至${briefTarget}`,
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
            let path = item.localFileOrgImageUrl.replace(fileName, "");
            let newFileName = fileName;
            let newPath = this.file.externalRootDirectory + "DCIM/Reddah/";
            
            let briefTarget = "DCIM/Reddah/" + newFileName;
            
            const toast = await this.toastController.create({
                message: `图片已保存至${briefTarget}`,
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
