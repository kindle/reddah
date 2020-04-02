import { Component, OnInit, Input, ViewChild, NgZone } from '@angular/core';
import { ModalController, ToastController, ActionSheetController, Platform, IonSlides } from '@ionic/angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { LocalStorageService } from 'ngx-webstorage';
//import 'hammerjs';
import { ReddahService } from '../../reddah.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';

@Component({
    selector: 'app-image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {
    @Input() index;
    @Input() imgSourceArray;
    @Input() imgTitle = '';
    @Input() imgDescription = '';
    @Input() showDownload = false;
    @Input() base64 = false;

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
        private clipboard: Clipboard,
        private platform: Platform,
        private zone: NgZone,
    ) {
    }

    isCordova = true;
    //0: web preview url, 1:local preview, 2: on-going, 3: local org, 
    ngOnInit() {
        this.isCordova = this.platform.is('cordova');
        this.slideOpts = {
            centeredSlides: 'true',
            initialSlide: this.index,
        };

        for(let i=0;i<this.imgSourceArray.length;i++){
            let storedKey = this.imgSourceArray[i].webPreviewUrl;
            let fileName = storedKey.replace("///login.reddah.com/uploadPhoto/","");
            storedKey = storedKey.replace("///","https://");
            let preview = this.localStorageService.retrieve(storedKey);
            let org = this.localStorageService.retrieve(storedKey.replace("_reddah_preview",""));
            
            this.imgSourceArray[i].webPreviewUrl = this.imgSourceArray[i].webPreviewUrl.replace("///login.reddah.com","https://login.reddah.com")
            if(org){
                let localUrl = (<any>window).Ionic.WebView.convertFileSrc(org);
                this.imgSourceArray[i].localhostImageUrl = localUrl;
                this.imgSourceArray[i].localFileImageUrl = org;
                this.imgSourceArray[i].previewImageFileName = fileName;
                this.imgSourceArray[i].isOrgViewed = 3;
            }
            else if(preview){
                let localUrl = (<any>window).Ionic.WebView.convertFileSrc(org);
                this.imgSourceArray[i].localhostImageUrl = localUrl;
                this.imgSourceArray[i].localFileImageUrl = preview;
                this.imgSourceArray[i].previewImageFileName = fileName;
                this.imgSourceArray[i].isOrgViewed = 1;
            }else{
                this.imgSourceArray[i].localhostImageUrl = this.imgSourceArray[i].webPreviewUrl;
                this.imgSourceArray[i].localFileImageUrl = this.imgSourceArray[i].webPreviewUrl;
                this.imgSourceArray[i].previewImageFileName = fileName;
                this.imgSourceArray[i].isOrgViewed = 0;
            }

        }
        if(this.index==0)
            this.flag = true;
    }

    flag = false;
    ionViewDidEnter(){
        

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
        if(this.base64){
            const actionSheet = await this.actionSheetController.create({
                buttons: [
                {
                    text: this.reddah.instant("Menu.Mark"),
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
                    text: this.reddah.instant("Common.Save"),
                    icon: 'ios-save',
                    handler: () => {
                        let link = document.createElement("a");
                        let base64string = this.imgSourceArray[0].webPreviewUrl;
                        //base64string = base64string.replace("image/jpeg", "image/octet-stream");
                        link.setAttribute("href", base64string);
                        link.setAttribute("download", "reddah");
                        link.click();
                    }
                }, 
                ]
            });
            await actionSheet.present();
        }
        else{
            const actionSheet = await this.actionSheetController.create({
                buttons: [
                /*{
                    text: this.translate.instant("Pop.ToFriend"),
                    icon: 'share',
                    handler: () => {
                        
                    }
                },*/ 
                {
                    text: this.reddah.instant("Common.Copy"),
                    icon: 'copy',
                    handler: () => {
                        let url = item.webPreviewUrl;
                        this.clipboard.copy(url);
                        this.reddah.toast(url, "primary");
                    }
                },
                {
                    text: this.reddah.instant("Menu.Mark"),
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
                    text: this.reddah.instant("Common.Save"),
                    icon: 'ios-save',
                    handler: () => {
                        this.downloadImage(item);
                    }
                }, 
                ]
            });
            await actionSheet.present();
          

        }
    }

    @ViewChild(IonSlides) slides: IonSlides;

    ionSlideWillChange(){
        this.slides.getActiveIndex().then(index=>
        {
            //if(index>=0&&index<this.enhanceImgSourceArray.length){
            //    let item = this.enhanceImgSourceArray[index];
            //    if(item.isOrgViewed==0)
            //        this.downloadOrgImage(item);
            //}

            //alert(index)

            this.flag = true;
        });
        
    }
    //loadProgress : any;

    getFileName(str){
        let lastSplashIndex = str.lastIndexOf('/');
        return str.substring(lastSplashIndex+1);
    }
    async downloadOrgImage(item, cp = false) {
        let briefTarget = "DCIM/Reddah/";// + newFileName;
        const toast = await this.toastController.create({
            message: `${this.reddah.instant("Common.Save")}:${briefTarget}`,
            //showCloseButton: false,
            position: 'bottom',
            duration: 2500
        });

        //set status as loading
        this.zone.run(() => {
            item.isOrgViewed = 2;
        })
        // only against preview image
        this.fileTransfer = this.transfer.create();  
        //this.fileTransfer.onProgress((data)=>{
        //    this.loadProgress = data.loaded/data.total*100;
        //});
        let orgImageUrl = item.webPreviewUrl.replace("///","https://").replace("_reddah_preview","");
        let orgImageFileName = this.getFileName(item.previewImageFileName.replace("_reddah_preview",""));
        //this.fileTransfer.download(orgImageUrl, this.file.applicationStorageDirectory + orgImageFileName).then((entry) => {
        this.fileTransfer.download(orgImageUrl, this.reddah.getDeviceDirectory()+"reddah/" + orgImageFileName).then((entry) => {
            //let localFileImageUrl = this.file.applicationStorageDirectory + orgImageFileName;
            let localFileImageUrl = this.reddah.getDeviceDirectory() + "reddah/" + orgImageFileName;
            this.localStorageService.store(item.webPreviewUrl.replace("_reddah_preview",""), localFileImageUrl);
            //this.reddah.appPhoto[item.webPreviewUrl] = (<any>window).Ionic.WebView.convertFileSrc(localFileImageUrl);
            for(let i=0;i<this.imgSourceArray.length;i++){
                if(this.imgSourceArray[i].webPreviewUrl===item.webPreviewUrl){
                    let localhostImageUrl = (<any>window).Ionic.WebView.convertFileSrc(localFileImageUrl);
                    this.zone.run(() => {
                        this.imgSourceArray[i].localhostImageUrl = localhostImageUrl;
                        this.imgSourceArray[i].localFileImageUrl = localFileImageUrl;
                        this.imgSourceArray[i].isOrgViewed = 3;
                    });
                    
                    break;
                }
            }

            if(cp==true){
                //copy from local directory
                let fileName = this.getFileName(item.previewImageFileName.replace("_reddah_preview",""));
                let path = item.localFileImageUrl.replace(fileName, "");
                let newFileName = fileName;
                let newPath = this.reddah.getOutputDeviceDirectory() + "DCIM/Reddah/";

                this.file.copyFile(path, fileName, newPath, newFileName).then((data)=>{
                    toast.present();
                });
            }
        }, (error) => {
            //console.log(JSON.stringify(error));
        });        
    }

    async downloadImage(item){
        if(item.isOrgViewed==3)//already download org image
        {
            this.copy(item);
        }
        else
        {
           this.downloadOrgImage(item, true);
        }
      
    }

    async copy(item){
        //copy from local directory
        let fileName = this.getFileName(item.previewImageFileName.replace("_reddah_preview",""));
        let path = item.localFileImageUrl.replace(fileName, "");
        let newFileName = fileName;
        let newPath = this.reddah.getOutputDeviceDirectory() + "DCIM/Reddah/";

        let briefTarget = "DCIM/Reddah/";// + newFileName;

        const toast = await this.toastController.create({
            message: `${this.reddah.instant("Common.Save")}:${briefTarget}`,
            //showCloseButton: false,
            position: 'bottom',
            duration: 2500
        });

        this.file.copyFile(path, fileName, newPath, newFileName).then((data)=>{
            toast.present();
        });
    }
  
}
