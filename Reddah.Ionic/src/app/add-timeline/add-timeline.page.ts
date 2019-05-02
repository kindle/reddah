import { Component, OnInit, Input } from '@angular/core';
import { PopoverController, NavController, LoadingController, ModalController } from '@ionic/angular'
import { TimelinePopPage } from '../article-pop/timeline-pop.page';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ReddahService } from '../reddah.service';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { CacheService } from "ionic-cache";
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer';
import { LocalStorageService } from 'ngx-webstorage';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
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
        /*this.activatedRoute.queryParams.subscribe((params: Params) => {
            let postType = params['postType'];
            alert(this.postType)
            if(postType==1)//photo
            {
                this.takePhoto();
            }
            else//from library
            {
                this.fromLib();
            }
        });
        */
        

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

        this.dragulaService.dropModel('bag').subscribe((value) => {
            console.log(value);
            this.formData.delete("key");
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
    
    photos = [];
    photos_trash = [];
    dragging = false;
    dragToDel = false;
    yourThoughts: string = "";
    location = "";
    debug = "";
    formData = new FormData();

    async submit(){
        const loading = await this.loadingController.create({
            message: 'uploading images...',
            spinner: 'circles',
        });
        await loading.present();

        /*
        this.photos.forEach((photo)=>{
            //append org photo form data
            this.prepareData(photo.fileUrl);

            //append preview photo form data
            let orgFileUrl = photo.fileUrl;
            orgFileUrl = orgFileUrl.substring(orgFileUrl.lastIndexOf('/')+1);
            let parts = orgFileUrl.split('.');
            let previewFileName = parts[0] + "_reddah_preview." + parts[1].split('?')[0];
            this.resize(photo.fileUrl, previewFileName);
        })
        */
        
        this.formData.append('thoughts', this.yourThoughts);
        this.formData.append('location', this.location);

        
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
              this.debug+=JSON.stringify(error);
            }
        );
    }

    async addNewPhoto(ev: any) {
      const popover = await this.popoverController.create({
          component: TimelinePopPage,
          event: ev,
          translucent: true
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
        });
        
    }

    async addPhotoToFormData(photo){
        //append org photo form data
        this.prepareData(photo.fileUrl);

        //append preview photo form data
        let orgFileUrl = photo.fileUrl;
        orgFileUrl = orgFileUrl.substring(orgFileUrl.lastIndexOf('/')+1);
        let parts = orgFileUrl.split('.');
        let previewFileName = parts[0] + "_reddah_preview." + parts[1].split('?')[0];
        this.resize(photo.fileUrl, previewFileName);
    }

    async resize(uri, fileName){
        let options = {
            uri: uri,
            folderName: 'reddah_resize',
            fileName: fileName, 
            quality: 30,
            width: 800,
            height: 800
           } as ImageResizerOptions;
           
        
        ImageResizer
            .resize(options)
            .then((filePath: string) => this.prepareData(filePath))
            .catch(e => alert(e));
    }

    async prepareData(filePath) {
        this.file.resolveLocalFilesystemUrl(filePath)
            .then(entry => {
                ( <FileEntry> entry).file(file => this.readFile(file))
            })
            .catch(err => {
                console.error(JSON.stringify(err));
            });
    }
    
    async readFile(file: any) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const imgBlob = new Blob([reader.result], {
                type: file.type
            });
            this.formData.append('file'+file.name, imgBlob, file.name);
        };
        reader.readAsArrayBuffer(file);
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
