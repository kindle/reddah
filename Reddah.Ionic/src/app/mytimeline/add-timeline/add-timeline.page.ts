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

@Component({
    selector: 'app-add-timeline',
    templateUrl: './add-timeline.page.html',
    styleUrls: ['./add-timeline.page.scss'],
})
export class AddTimelinePage implements OnInit {

    @Input() postType: number;

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
    ) { 
        this.dragulaService.drag('bag')
        .subscribe(({ name, el }) => {
            this.dragging = true;
        });

        this.dragulaService.dragend('bag')
        .subscribe(({ name, el }) => {
            this.removeClass(el, "ex-over");
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
                this.addClass(el, "ex-over");
            }
            else{
                this.dragToDel = false;
                this.removeClass(el, "ex-over");
            }
        });

        this.dragulaService.out('bag')
        .subscribe(({ el, container }) => {
            this.dragToDel = false;
            this.removeClass(el, "ex-over");
        });
    }

    private hasClass(el: Element, name: string): any {
        return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(el.className);
    }
    private addClass(el: Element, name: string): void {
        if (!this.hasClass(el, name)) {
            el.className = el.className ? [el.className, name].join(" ") : name;
        }
    }
    private removeClass(el: Element, name: string): void {
        if (this.hasClass(el, name)) {
            el.className = el.className.replace(
            new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"),
            ""
            );
        }
    }

    close(){
        this.modalController.dismiss();
    }

    ngOnInit() {
        if(this.postType==1)//photo
        {
            this.takePhoto();
        }
        else//from library
        {
            this.fromLib();
        }
    }
    
    //photos = [{fileUrl: '1', webUrl:'web1'},{fileUrl: '2', webUrl:'web2'},{fileUrl: '3', webUrl:'web3'}];
    photos = [];
    photos_trash = [];
    dragging = false;
    dragToDel = false;
    yourThoughts: string = "";
    location = "";
    formData = new FormData();

    async submit(){
        const loading = await this.loadingController.create({
            message: 'uploading images...',
            spinner: 'circles',
        });
        await loading.present();
        
        this.formData.append('thoughts', this.yourThoughts);
        this.formData.append('location', this.location);
        //send the key in UI display order
        this.formData.append('order', this.photos.map(e=>e.fileUrl).join(","));
        this.formData.append('type', JSON.stringify(1));//feedback:9, normal:0, timeline:1
        this.formData.append('feedbackType', JSON.stringify(-1));
        //alert(this.photos.map(e=>e.fileUrl).join(","));

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
            console.log(JSON.stringify(err));
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
            console.log(JSON.stringify(err));
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
        let removdQFileExtention = fileExtention.lastIndexOf('?')==-1 ? 
            fileExtention : fileExtention.replace(fileExtention.substring(fileExtention.lastIndexOf('?')),"");
        
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
