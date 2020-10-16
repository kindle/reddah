import { Component, OnInit, Input } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { Crop } from '@ionic-native/crop/ngx';

import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, LocalNotifications,
    CameraPhoto, CameraSource, HapticsImpactStyle } from '@capacitor/core';
    
const { Browser, Camera, Filesystem, Haptics, Device, Storage } = Plugins;

@Component({
    selector: 'app-change-photo',
    templateUrl: './change-photo.page.html',
    styleUrls: ['./change-photo.page.scss'],
})
export class ChangePhotoPage implements OnInit {

    @Input() title: string;
    @Input() tag: string;
    @Input() targetUserName: string;
    formData = new FormData();

    constructor(
        private modalController: ModalController,
        private loadingController: LoadingController,
        public reddah: ReddahService,
        private crop: Crop,
        private file: File,
        ) { }

    ngOnInit() {
        
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
        /*
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            correctOrientation: true
        }
            
        Camera.getPicture(options).then((imageData) => {
            this.crop.crop(imageData, { quality: 100, targetWidth: -1, targetHeight: -1 })
            .then(
                    newCropImageData => {
                    //console.log('new image path is: ' + newCropImageData);
                    this.prepareData(newCropImageData);
                },
                error => console.error('Error cropping image', error)
            );
        }, (err) => {
            // Handle error
            console.log(JSON.stringify(err));
        });*/

        Camera.getPhoto({
            resultType: CameraResultType.Uri, 
            source: CameraSource.Camera, 
            quality: 100 
        }).then((imageData) => {
            this.crop.crop(imageData.path, { quality: 100, targetWidth: -1, targetHeight: -1 })
            .then(
                    newCropImageData => {
                    //console.log('new image path is: ' + newCropImageData);
                    //this.prepareData(newCropImageData);
                    this.reddah.uploadPictureFromCrop(newCropImageData, this.formData).then(()=>{
                        this.changePhoto();
                    });
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
        /*
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
            correctOrientation: true
        }
            
        this.camera.getPicture(options).then((imageData) => {
            //this.photos.push(Capacitor.convertFileSrc(imageData));
            //this.prepareData(imageData);
            //this.prepareData(Capacitor.convertFileSrc(imageData));
            this.crop.crop(imageData, { quality: 100, targetWidth: -1, targetHeight: -1 })
            .then(
                    newCropImageData => {
                    //console.log('new image path is: ' + newCropImageData);
                    this.prepareData(newCropImageData);
                },
                error => console.error('Error cropping image', error)
            );
            
        }, (err) => {
            console.log(JSON.stringify(err));
        });
        */
       Camera.getPhoto({
            resultType: CameraResultType.Uri, 
            source: CameraSource.Photos, 
            quality: 100 
        }).then((imageData) => {
            //this.photos.push(Capacitor.convertFileSrc(imageData));
            //this.prepareData(imageData);
            //this.prepareData(Capacitor.convertFileSrc(imageData));
            this.crop.crop(imageData.path, { quality: 100, targetWidth: -1, targetHeight: -1 })
            .then(
                    newCropImageData => {
                    //console.log('new image path is: ' + newCropImageData);
                    //this.prepareData(newCropImageData);


                    this.reddah.uploadPictureFromCrop(newCropImageData, this.formData).then(()=>{
                        this.changePhoto();
                    });
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
            cssClass: 'my-custom-class',
            spinner: null,
            duration: 30000,
            message: `<div class='bar-box'>${this.reddah.getLoadingEffect()}
            <div class='bar-text'>${this.reddah.instant("Article.Loading")}</div>
            </div>`,
            translucent: true,
            backdropDismiss: true
        });
        await loading.present();

        this.formData.append('tag', this.tag);
        if(this.targetUserName!=null&&this.targetUserName.length>0)
        {
            //only sub-info page change photo check if is admin
            //my-info and my timeline change cover do not check, just send empty
            this.formData.append("targetUserName", this.targetUserName);
        }
        this.reddah.updateUserPhoto(this.formData)
        .subscribe(result => {
            loading.dismiss();
            
            if(result.Success==0)
            { 
                this.modalController.dismiss(true);
            }
            else
            {
                this.modalController.dismiss(false);
            }
            
        },
        error=>{
            console.log(JSON.stringify(error));
        });
    }
}
