import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { LocalStorageService } from 'ngx-webstorage';

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

    slideOpts = {};
    private fileTransfer: FileTransferObject; 

    constructor(
        private modalController: ModalController,
        private transfer: FileTransfer, 
        private file: File,
        private localStorageService: LocalStorageService,
        private toastController: ToastController,
    ) {
    }

    ngOnInit() {
        this.slideOpts = {
            centeredSlides: 'true',
            initialSlide: this.index,
        };
        for(let i=0;i<this.imgSourceArray.length;i++){
            let org = this.localStorageService.retrieve(this.imgSourceArray[i]);
            if(org!=null){
                let webUrl = (<any>window).Ionic.WebView.convertFileSrc(org);
                this.enhanceImgSourceArray[i] = { 
                    webUrl: webUrl, 
                    downloadUrl: org,
                    fileName: org.replace("file:///storage/emulated/0/DCIM/Reddah/",""),
                    isOrgViewed: true, 
                }
            }
            else{
                this.enhanceImgSourceArray[i] = { 
                    webUrl: this.imgSourceArray[i], 
                    downloadUrl: this.imgSourceArray[i],
                    fileName: '',
                    isOrgViewed: false,
                }
            }
        }
    }

    org(src){
        return src.replace("_reddah_preview","")
    }

    closeModal(event) {
        var target = event.target || event.srcElement || event.currentTarget;
        if(target.id==="showOrgImage"||target.id==="downloadOrgImage"){}
        else{
            this.modalController.dismiss();
        }
    }

    progress : any;

    showOrgImage(preview_url) {
        let orgUrl = preview_url.replace("_reddah_preview","")
        let fileName = orgUrl.replace("///login.reddah.com/uploadPhoto/","");

            //fileName = fileName.replace("http://localhost:8080/_file_/data/user/0/com.reddah/","");
        let pUrl = orgUrl.replace("///","https://");
        
        this.fileTransfer = this.transfer.create();  
        this.fileTransfer.onProgress((data)=>{
            let percentage = data.loaded/data.total*100;
            let timer = setInterval(() => {
                this.progress = (percentage).toFixed(0);
                if (percentage >= 99) {
                    clearInterval(timer);
                }
            }, 300);
        });
        
        this.fileTransfer.download(pUrl, this.file.applicationStorageDirectory + fileName).then((entry) => {
            let webUrl = this.file.applicationStorageDirectory + fileName;
            this.localStorageService.store(preview_url, webUrl);
            for(let i=0;i<this.imgSourceArray.length;i++){
                if(this.imgSourceArray[i]===preview_url){
                    let newWebUrl = (<any>window).Ionic.WebView.convertFileSrc(webUrl);
                    this.enhanceImgSourceArray[i] = { 
                        webUrl: newWebUrl, 
                        downloadUrl: webUrl,
                        fileName: fileName,
                        isOrgViewed: true, 
                  }
                    break;
                }
            }
        }, (error) => {
            console.log(JSON.stringify(error));
        });
    }

    async download(item){
        if(!item.isOrgViewed)
        {
            let url = item.downloadUrl;
            let pUrl = url.replace("///","https://");
            let fileName = url.replace("///login.reddah.com/uploadPhoto/","");
            let target = this.file.externalRootDirectory+"DCIM/Reddah/" + fileName;
            this.fileTransfer = this.transfer.create(); 
            const toast = await this.toastController.create({
                message: `图片已保存至${target}`,
                showCloseButton: false,
                position: 'bottom',
                duration: 2500
            });
            alert(pUrl+"_"+target)
            this.fileTransfer.download(pUrl, target, true).then((entry) => {
                toast.present();
            }, (error) => {
                alert(JSON.stringify(error));
            });
        }
        else
        {
            let path = item.downloadUrl.replace(item.fileName, "");
            let fileName = item.fileName;
            let newPath = this.file.externalRootDirectory+"DCIM/Reddah/";
            let newFileName = item.fileName;

            let target = newPath + newFileName;
            alert(target)
            const toast = await this.toastController.create({
                message: `图片已保存至${target}`,
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
