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
    ) {}

    ngOnInit() {
        this.slideOpts = {
            centeredSlides: 'true',
            initialSlide: this.index,
        };
        this.imgSourceArray.forEach((preview)=>{
            let org = this.localStorageService.retrieve(preview);
            alert(org);
            if(org!=null){
                preview = org;
            }
        })
    }

    org(src){
        return src.replace("_reddah_preview","")
    }

    closeModal(event) {
        var target = event.target || event.srcElement || event.currentTarget;
        if(target.id==="showOrgImage"){}
        else{
            this.modalController.dismiss();
        }
    }

    progress : any;

    showOrgImage(preview_url){
      alert(preview_url);
        let orgUrl = preview_url.replace("_reddah_preview","")
        let fileName = orgUrl.replace("///login.reddah.com/uploadPhoto/","");
        let pUrl = orgUrl.replace("///","https://");
        
        this.fileTransfer = this.transfer.create();  
        this.fileTransfer.onProgress((data)=>{
            //this.progress = JSON.stringify(data);
            alert(JSON.stringify(data));
        });
        alert('downloadto:'+this.file.applicationStorageDirectory + fileName)
        this.fileTransfer.download(pUrl, this.file.applicationStorageDirectory + fileName).then((entry) => {
            let webUrl = (<any>window).Ionic.WebView.convertFileSrc(entry.toURL());
            this.localStorageService.store(preview_url, webUrl);
            this.imgSourceArray.forEach((preview)=>{
              if(preview==preview_url){
                  preview = webUrl;
                  alert('change to:'+webUrl);
              }
          })
        }, (error) => {
            alert(JSON.stringify(error));
        });
    }
}
