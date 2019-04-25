import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ReddahService } from '../reddah.service';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { LocalStorageService } from 'ngx-webstorage';
import { Crop } from '@ionic-native/crop/ngx';

@Component({
  selector: 'app-crop-photo',
  templateUrl: './crop-photo.page.html',
  styleUrls: ['./crop-photo.page.scss'],
})
export class CropPhotoPage implements OnInit {

  @Input() imageData: any;

  constructor(
    private modalController: ModalController,
    private reddahService: ReddahService,
    private localStorageService: LocalStorageService,
    private crop: Crop,
    private transfer: FileTransfer,
  ) { }

  async ngOnInit() {
      
  }

  async close() {
      await this.modalController.dismiss(false);
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
      };
      reader.readAsArrayBuffer(file);
  }

}
