import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
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
    @Input() imgTitle = '';
    @Input() imgDescription = '';

    slideOpts = {};
    private fileTransfer: FileTransferObject; 

    constructor(
        private modalController: ModalController,
        private transfer: FileTransfer, 
        private file: File,
        private localStorageService: LocalStorageService,
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
                this.imgSourceArray[i] = webUrl;
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
                    this.imgSourceArray[i] = newWebUrl;
                    break;
                }
            }
        }, (error) => {
            console.log(JSON.stringify(error));
        });
    }

    download(url){
        let pUrl = url.replace("///","https://");
        alert("download:"+pUrl)
        let fileName = url.replace("///login.reddah.com/uploadPhoto/","");
        let downloadDir = "/reddah/download";
        /*this.file.checkDir(this.file.externalRootDirectory, "reddah").then(data=>{
            
            
        })*/
        this.fileTransfer.download(pUrl, this.file.externalRootDirectory + fileName).then((entry) => {
            alert('downloadto:'+this.file.externalRootDirectory + fileName);
            console.log("download success");
        }, (error) => {
            
            alert(JSON.stringify(error));
        });
    }
}
