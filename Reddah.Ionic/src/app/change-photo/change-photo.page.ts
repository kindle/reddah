import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ReddahService } from '../reddah.service';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { LocalStorageService } from 'ngx-webstorage';
import { CropPhotoPage } from '../crop-photo/crop-photo.page';

@Component({
  selector: 'app-change-photo',
  templateUrl: './change-photo.page.html',
  styleUrls: ['./change-photo.page.scss'],
})
export class ChangePhotoPage implements OnInit {

  @Input() title: string;

  constructor(
    private modalController: ModalController,
    private reddahService: ReddahService,
    private localStorageService: LocalStorageService) { }

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
          this.cropPhoto(imageData);
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
          this.cropPhoto(imageData);
      }, (err) => {
          console.log(JSON.stringify(err));
      });
      
  }

  async cropPhoto(imageData: any){
      const userModal = await this.modalController.create({
        component: CropPhotoPage,
        componentProps: { imageData: imageData }
      });
        
      await userModal.present();
      const { data } = await userModal.onDidDismiss();
  }

}
