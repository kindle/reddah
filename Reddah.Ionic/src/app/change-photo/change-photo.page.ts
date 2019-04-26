import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ReddahService } from '../reddah.service';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { LocalStorageService } from 'ngx-webstorage';
import { CropPhotoPage } from '../crop-photo/crop-photo.page';
import { Crop } from '@ionic-native/crop/ngx';

@Component({
  selector: 'app-change-photo',
  templateUrl: './change-photo.page.html',
  styleUrls: ['./change-photo.page.scss'],
})
export class ChangePhotoPage implements OnInit {

    @Input() title: string;
    @Input() tag: string;
    formData = new FormData();

    constructor(
        private modalController: ModalController,
        private loadingController: LoadingController,
        private reddahService: ReddahService,
        private localStorageService: LocalStorageService,
        private crop: Crop,
        private file: File,
        ) { }

    async ngOnInit() {
        
    }

    async close() {
        await this.modalController.dismiss(false);
    }

    //1: take a photo, 2: from lib
    async select(type){
        if(type==1)//photo
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
            //this.photos.push((<any>window).Ionic.WebView.convertFileSrc(imageData));
            //this.prepareData(imageData);
            //this.prepareData((<any>window).Ionic.WebView.convertFileSrc(imageData));
            this.crop.crop(imageData, { quality: 100, targetWidth: -1, targetHeight: -1 })
            .then(
                    newCropImageData => {
                    console.log('new image path is: ' + newCropImageData);
                    this.prepareData(newCropImageData);
                },
                error => console.error('Error cropping image', error)
            );
        }, (err) => {
            // Handle error
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
            //this.photos.push((<any>window).Ionic.WebView.convertFileSrc(imageData));
            //this.prepareData(imageData);
            //this.prepareData((<any>window).Ionic.WebView.convertFileSrc(imageData));
            this.crop.crop(imageData, { quality: 100, targetWidth: -1, targetHeight: -1 })
            .then(
                    newCropImageData => {
                    console.log('new image path is: ' + newCropImageData);
                    this.prepareData(newCropImageData);
                },
                error => console.error('Error cropping image', error)
            );
            
        }, (err) => {
            console.log(JSON.stringify(err));
        });
        
    }
    
    async prepareData(filePath) {
        this.file.resolveLocalFilesystemUrl(filePath)
            .then(entry => {
                ( <FileEntry> entry).file(file => this.readFile(file))
            })
            .catch(err => {
                console.log(JSON.stringify(err));
            });
    }
    
    async readFile(file: any) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const imgBlob = new Blob([reader.result], {
                type: file.type
            });
            this.formData.append('file'+file.name, imgBlob, file.name);
            this.changePhoto();
        };
        reader.readAsArrayBuffer(file);
    }

    async changePhoto(){
        const loading = await this.loadingController.create({
            message: 'uploading images...',
            spinner: 'circles',
        });
        await loading.present();

        this.formData.append('tag', this.tag);
        this.reddahService.updateUserPhoto(this.formData)
        .subscribe(result => 
            {
                loading.dismiss();
                
                if(result.Success==0)
                { 
                    //go back and refresh photo
                }
                else
                {
                    alert(result.Message);
                }
                
            },
            error=>{
                console.log(JSON.stringify(error));
            }
        );
    }
}
