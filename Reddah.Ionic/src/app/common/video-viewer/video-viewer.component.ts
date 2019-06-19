import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController, ActionSheetController, Slides } from '@ionic/angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { LocalStorageService } from 'ngx-webstorage';
import 'hammerjs';
import { ReddahService } from '../../reddah.service';
import { CacheService } from 'ionic-cache';

@Component({
    selector: 'app-video-viewer',
    templateUrl: './video-viewer.component.html',
    styleUrls: ['./video-viewer.component.scss']
})
export class VideoViewerComponent implements OnInit {
    @Input() id;
    @Input() src;


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
    ) {
    }

    ngOnInit() {
    }

    
    

    close() {
        this.modalController.dismiss();
    }


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
            //let localFileOrgImageUrl = this.file.applicationStorageDirectory + orgImageFileName;
            let localFileOrgImageUrl = this.file.externalRootDirectory+"reddah/" + orgImageFileName;
            this.localStorageService.store(item.webPreviewUrl, localFileOrgImageUrl);
            this.reddah.appPhoto[item.webPreviewUrl] = (<any>window).Ionic.WebView.convertFileSrc(localFileOrgImageUrl);
            
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
