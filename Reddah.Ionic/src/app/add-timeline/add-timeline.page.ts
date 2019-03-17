import { Component, OnInit } from '@angular/core';
import { PopoverController, NavController, LoadingController } from '@ionic/angular'
import { TimelinePopPage } from '../article-pop/timeline-pop.page';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ReddahService } from '../reddah.service';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';

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

    ) { }

    ngOnInit() {
      //this.photos = [1,2,3,4,5,6,7,8,9]
    }
    
    texts = [];
    photos = [];
    yourThoughts: string;
    location = "";

    formData = new FormData();

    async submit(){
        const loading = await this.loadingController.create({
            message: 'uploading images...',
            spinner: 'circles',
        });
        await loading.present();

        //this.yourThoughts, this.photos.join('$$$'), this.location
        this.formData.append('thoughts', this.yourThoughts);
        this.formData.append('location', this.location);
        this.reddahService.addTimeline(this.formData)
        .subscribe(result => 
        {
            loading.dismiss();
            if(result.Success==0)
            { 
                this.navController.navigateRoot('/timeline');
            }
            else{
              alert(result.Message);
            }
            
        });
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
            // imageData is either a base64 encoded string or a file URI
            // If it's base64 (DATA_URL):
            //alert(imageData)
            this.texts.push(imageData);
            this.photos.push((<any>window).Ionic.WebView.convertFileSrc(imageData));
            this.prepareData(imageData);
            //this.photos.push('data:image/jpeg;base64,' + imageData);
        }, (err) => {
            // Handle error
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
            // imageData is either a base64 encoded string or a file URI
            // If it's base64 (DATA_URL):
            //alert(imageData)
            this.texts.push(imageData);
            this.photos.push((<any>window).Ionic.WebView.convertFileSrc(imageData));
            this.prepareData(imageData);
        }, (err) => {
            // Handle error
        });
        
    }

    prepareData(filePath) {
      this.file.resolveLocalFilesystemUrl(filePath)
          .then(entry => {
              ( <FileEntry> entry).file(file => this.readFile(file))
          })
          .catch(err => {
              
          });
    }
    
    readFile(file: any) {
        const reader = new FileReader();
        reader.onloadend = () => {
            
            const imgBlob = new Blob([reader.result], {
                type: file.type
            });
            this.formData.append('file', imgBlob, file.name);
        };
        reader.readAsArrayBuffer(file);
    }




}
