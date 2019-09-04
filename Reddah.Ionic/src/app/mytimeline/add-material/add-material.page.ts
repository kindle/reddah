import { Component, OnInit, Input } from '@angular/core';
import { PopoverController, NavController, LoadingController, ModalController } from '@ionic/angular'
import { TimelinePopPage } from '../../common/timeline-pop.page';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ReddahService } from '../../reddah.service';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { CacheService } from "ionic-cache";
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer';
import { LocalStorageService } from 'ngx-webstorage';
import { ImageViewerComponent } from '../../common/image-viewer/image-viewer.component';
import { DragulaService } from 'ng2-dragula';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-add-material',
    templateUrl: './add-material.page.html',
    styleUrls: ['./add-material.page.scss'],
})
export class AddMaterialPage implements OnInit {

    @Input() article: any;

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
    ) { 
        this.dragulaService.drag('bag')
        .subscribe(({ name, el }) => {
            this.dragging = true;
        });

        this.dragulaService.dragend('bag')
        .subscribe(({ name, el }) => {
            this.reddahService.removeClass(el, "ex-over");
            this.dragToDel = false;
            this.dragging = false;
        });
        this.dragulaService.dropModel('bag')
            .subscribe(({ el, target, source, sourceModel, targetModel, item }) => {
                if(target.id=="delete-photo"){
                    //delete org photo form data
                    this.formData.delete(item["fileUrl"]);
                    //delete resize photo form data
                    this.formData.delete(item["fileUrl"]+"_reddah_preview");
                }
        });
        
        if(!this.dragulaService.find('bag')){
            this.dragulaService.createGroup('bag', {
                removeOnSpill: false,
                revertOnSpill: true,
                moves: (el, container, handle) => {
                    // you can't move plus button
                    return handle.tagName !== "ION-ICON";
                },
                accepts: (el, target, source, sibling) => {
                    if (sibling === null) {
                        return false;
                    }
                    return true;
                },
            });
        }

        this.dragulaService.over('bag')
        .subscribe(({ el, container }) => {
            if(container.id=="delete-photo"){
                this.dragToDel = true;
                this.reddahService.addClass(el, "ex-over");
            }
            else{
                this.dragToDel = false;
                this.reddahService.removeClass(el, "ex-over");
            }
        });

        this.dragulaService.out('bag')
        .subscribe(({ el, container }) => {
            this.dragToDel = false;
            this.reddahService.removeClass(el, "ex-over");
        });
    }

    

    close(){
        this.modalController.dismiss();
    }

    
    
    ngOnInit() {
    }
    
    photos = [];
    photos_trash = [];
    dragging = false;
    dragToDel = false;
    yourThoughts: string = "";
    location = "";
    formData = new FormData();

    async submit(){
        const loading = await this.loadingController.create({
            message: this.translate.instant("Article.Loading"),
            spinner: 'circles',
        });
        await loading.present();
        
        this.formData.append('thoughts', this.yourThoughts);
        this.formData.append('location', this.location);
        this.formData.append('feedbackType', JSON.stringify(this.feedbackType));
        
        this.formData.append("ref", JSON.stringify(0));
        this.formData.append('type', JSON.stringify(5));//material:5, feedback:4, normal:0, timeline:1, chat:2,groupchat:3,
        //send the key in UI display order
        this.formData.append('order', this.photos.map(e=>e.fileUrl).join(","));        

        this.reddahService.addTimeline(this.formData)
        .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0)
                { 
                    this.modalController.dismiss(true);
                }
                else
                {
                    alert(result.Message);
                }
                
            },
            error=>{
                //console.error(JSON.stringify(error));
                alert(JSON.stringify(error));
            }
        );
    }

    async addNewPhoto(ev: any) {
        const popover = await this.popoverController.create({
            component: TimelinePopPage,
            event: ev,
            translucent: true,
        });

        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data==1)//photo
        {
            await this.takePhoto();
        }
        else//from library
        {
            await this.fromLib();
        }
    }

    async takePhoto(){
        const options: CameraOptions = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            correctOrientation: true
        }
          
        Camera.getPicture(options).then((imageData) => {
            let data = {fileUrl: imageData, webUrl: (<any>window).Ionic.WebView.convertFileSrc(imageData)};
            this.photos.push(data);
            this.addPhotoToFormData(data);
        }, (err) => {
            //console.log(JSON.stringify(err));
        });
        
    }

    async fromLib()
    {
        const options: CameraOptions = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            correctOrientation: true
        }
          
        Camera.getPicture(options).then((imageData) => {
            let data = {fileUrl: imageData, webUrl: (<any>window).Ionic.WebView.convertFileSrc(imageData)};
            this.photos.push(data);
            this.addPhotoToFormData(data);
        }, (err) => {
            //console.log(JSON.stringify(err));
            alert(JSON.stringify(err));
        });
        
    }

    addPhotoToFormData(photo){
        //append org photo form data
        this.prepareData(photo.fileUrl, photo.fileUrl);

        //append preview photo form data
        let orgFileName = photo.fileUrl.substring(photo.fileUrl.lastIndexOf('/')+1);
        let fileExtention = orgFileName.substring(orgFileName.lastIndexOf('.'));
        //remove ?****
        let removdQFileExtention = fileExtention.replace(fileExtention.substring(fileExtention.lastIndexOf('?')),"");
        let previewFileName = orgFileName.replace(fileExtention,"") + "_reddah_preview" + removdQFileExtention;
        //alert(photo.fileUrl+"_"+previewFileName);
        let options = {
            uri: photo.fileUrl,
            folderName: 'reddah',
            fileName: previewFileName,
            quality: 20,
            width: 800,
            height: 800
        } as ImageResizerOptions;
        ImageResizer
            .resize(options)
            .then((filePath: string) => this.prepareData(filePath, photo.fileUrl+"_reddah_preview"))
            .catch(e => alert(e));
    }

    prepareData(filePath, formKey) {
        this.file.resolveLocalFilesystemUrl(filePath)
        .then(entry => {
            ( <FileEntry> entry).file(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    //org image data
                    const imgBlob = new Blob([reader.result], {
                        type: file.type
                    });
                    this.formData.append(formKey, imgBlob, file.name);
                };
                reader.readAsArrayBuffer(file);
            })
        })
        .catch(err => {
            console.error(JSON.stringify(err));
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
}
