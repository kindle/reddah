import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController, ActionSheetController, Slides } from '@ionic/angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { LocalStorageService } from 'ngx-webstorage';
import 'hammerjs';
import { ReddahService } from '../../reddah.service';
import { CacheService } from 'ionic-cache';

@Component({
    selector: 'app-video-viewer',
    templateUrl: './video-viewer.component.html',
    styleUrls: ['./video-viewer.component.scss']
})
export class VideoViewerComponent implements OnInit {
    @Input() id;
    @Input() src;
    @Input() poster;


    private fileTransfer: FileTransferObject; 

    constructor(
        private modalController: ModalController,
        private transfer: FileTransfer, 
        private file: File,
        private localStorageService: LocalStorageService,
        private toastController: ToastController,
        private actionSheetController: ActionSheetController,
        public reddah: ReddahService,
        private cacheService: CacheService,
    ) {
    }

    ngOnInit() {
    }

    
    

    close() {
        this.modalController.dismiss();
    }

  
}
