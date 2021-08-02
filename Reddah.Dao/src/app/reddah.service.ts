import { Injectable, NgZone } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders,
    HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
/*
import { Article } from "./model/article";
import { UserProfileModel } from './model/UserProfileModel';
import { UserModel, QueryCommentModel, NewCommentModel, NewTimelineModel, Queue, AppleUserModel } from './model/UserModel';
import { Locale } from './model/locale';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { LocalStorageService } from 'ngx-webstorage';
import { AlertController, LoadingController, NavController, ModalController, ToastController, Platform } from '@ionic/angular';
import { CacheService } from 'ionic-cache';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { Md5 } from 'ts-md5/dist/md5';
*/
import { createAnimation } from '@ionic/core'
import { Router } from '@angular/router';
/*import { Clipboard } from '@ionic-native/clipboard/ngx';
//import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer/ngx';

import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, LocalNotifications,
    CameraPhoto, CameraSource, HapticsImpactStyle } from '@capacitor/core';
    
import { Crop } from '@ionic-native/crop/ngx';
*/
import { DomSanitizer } from '@angular/platform-browser';
    
//const { Browser, Camera, Filesystem, Haptics, Device, Storage } = Plugins;

@Injectable({
    providedIn: 'root'
})
export class ReddahService {

    /*
    hapticsImpact(style = HapticsImpactStyle.Heavy) {
        Haptics.impact({
          style: style
        });
    }
    */

    appStore  = "ios";//"huawei","xiaomi","ios"
    

    constructor(
        private http: HttpClient,
        /*private localStorageService: LocalStorageService,
        private transfer: FileTransfer,
        private file: File,
        private toastController: ToastController,
        private platform: Platform,
        private cacheService: CacheService,
        private datePipe: DatePipe,
        private modalController: ModalController,
        private alertController: AlertController,
        private loadingController: LoadingController,*/
        private ngZone: NgZone,
        private router: Router,
        //private crop: Crop,
        //private clipboard: Clipboard,
        private sanitizer: DomSanitizer,
        //private imageResizer: ImageResizer
    ) { 
        
    }

    //******************************** */
    videoArticles = [];
    videoLoadedIds = [];
    videoDislikeGroups = [];
    videoDislikeUserNames = [];
    
    //VideoArticleCacheQueue = new Queue<any>();


    localeData;
    loadTranslate(locale){
        this.http.get<any>(`assets/i18n/${locale}.json`)
        .subscribe(res =>{
            this.localeData=this.flatten(res);
            //this.initPointTask();
        }, error =>{
            console.log(error);
        });
    }

    instant(key){
        if(this.localeData)
            return this.localeData[key];
        return key;
    }

    flatten (obj, prefix = [], current = {}) {
        if (typeof (obj) === 'object' && obj !== null) {
          Object.keys(obj).forEach(key => {
            this.flatten(obj[key], prefix.concat(key), current)
          })
        } else {
          current[prefix.join('.')] = obj
        }
      
        return current
    }

}
