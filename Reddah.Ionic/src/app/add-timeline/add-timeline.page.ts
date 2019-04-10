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
    
    texts = [];
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

        //test
        //this.formData.append('f1', '', 'file1');
        //this.formData.append('f2', '', 'file2');
        
        //this.debug+=JSON.stringify(json);
        this.reddahService.addTimeline(this.formData)
        .subscribe(result => 
            {
                loading.dismiss();
                this.debug+= JSON.stringify(result);
                if(result.Success==0)
                { 
                    let cacheKey = "this.reddah.getTimeline";
                    this.cacheService.removeItem(cacheKey);
                    this.router.navigate(['/timeline'], {
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
            this.texts.push(imageData);
            this.photos.push((<any>window).Ionic.WebView.convertFileSrc(imageData));
            this.prepareData(imageData);
            //this.prepareData((<any>window).Ionic.WebView.convertFileSrc(imageData));
            //this.photos.push('data:image/jpeg;base64,' + imageData);
        }, (err) => {
            // Handle error
            this.debug+="takeaphoto:"+JSON.stringify(err);
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
            this.texts.push(imageData);
            this.photos.push((<any>window).Ionic.WebView.convertFileSrc(imageData));
            this.prepareData(imageData);
            //this.prepareData((<any>window).Ionic.WebView.convertFileSrc(imageData));
        }, (err) => {
            this.debug+="fromlib:"+JSON.stringify(err);
        });
        
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
