import { Component, OnInit } from '@angular/core';
import { PopoverController, NavController, LoadingController } from '@ionic/angular'
import { TimelinePopPage } from '../article-pop/timeline-pop.page';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ReddahService } from '../reddah.service';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { CacheService } from "ionic-cache";
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer';
import { Crop } from '@ionic-native/crop/ngx';

@Component({
  selector: 'app-add-timeline',
  templateUrl: './add-timeline.page.html',
  styleUrls: ['./add-timeline.page.scss'],
})
export class AddTimelinePage implements OnInit {

    constructor(
      private popoverController: PopoverController,
      private reddahService: ReddahService,
      private navController: NavController,
      private fileTransfer: FileTransfer,
      private file: File,
      private loadingController: LoadingController,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private cacheService: CacheService,
      private crop: Crop,
    ) { 
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            let data = params['data'];
            if(data==1)//photo
            {
                this.takePhoto();
            }
            else//from library
            {
                this.fromLib();
            }
        });
    }

    goback(){
        this.navController.goBack();
    }

    ngOnInit() {}
    
    photos = [];
    yourThoughts: string;
    location = "";
    debug = "";
    formData = new FormData();

    async submit(){
        const loading = await this.loadingController.create({
            message: 'uploading images...',
            spinner: 'circles',
        });
        await loading.present();

        this.formData.append('thoughts', this.yourThoughts);
        this.formData.append('location', this.location);

        
        this.reddahService.addTimeline(this.formData)
        .subscribe(result => 
            {
                loading.dismiss();
                this.debug+= JSON.stringify(result);
                if(result.Success==0)
                { 
                    this.cacheService.clearGroup("TimeLinePage");
                    this.router.navigate(['/mytimeline'], {
                        queryParams: {
                            refresh: true//no use but you can sent the parameter
                        }
                    });
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
            this.inQueue(imageData);
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
            this.inQueue(imageData);
        }, (err) => {
            console.log(JSON.stringify(err));
        });
        
    }

    async inQueue(imageData){
        this.photos.push((<any>window).Ionic.WebView.convertFileSrc(imageData));
        this.prepareData(imageData);
        this.resize(imageData, this.getFileName(imageData));

    }

    getFileName(text){
        let name = text.substring(text.lastIndexOf('/')+1);
        let parts = name.split('.');
        return parts[0] + "_reddah_preview." + parts[1].split('?')[0];
    }

    async resize(uri, fileName){
        alert(fileName);
        let options = {
            uri: uri,
            folderName: 'reddah',
            fileName: fileName, 
            quality: 30,
            width: 200,
            height: 200
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
              this.debug+="prepare:"+JSON.stringify(err);
          });
    }
    
    async readFile(file: any) {
        const reader = new FileReader();
        reader.onloadend = () => {
            this.debug+="readfile_start"+file.name;
            const imgBlob = new Blob([reader.result], {
                type: file.type
            });
            this.formData.append('file'+file.name, imgBlob, file.name);
            this.debug+="readfile_complete"+file.name;
        };
        reader.readAsArrayBuffer(file);
    }




}
