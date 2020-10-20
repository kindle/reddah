import { Injectable, NgZone } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders,
    HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { LocalStorageService } from 'ngx-webstorage';
import { AlertController, LoadingController, NavController, ModalController, ToastController, Platform } from '@ionic/angular';

import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, LocalNotifications,
    CameraPhoto, CameraSource, HapticsImpactStyle } from '@capacitor/core';
    
import { DomSanitizer } from '@angular/platform-browser';
import { Locale } from './model/locale';
    
const { Browser, Camera, Filesystem, Haptics, Device, Storage } = Plugins;

@Injectable({
    providedIn: 'root'
})
export class ReddahService {

    hapticsImpact(style = HapticsImpactStyle.Heavy) {
        Haptics.impact({
          style: style
        });
    }

    appStore  = "ios";//"huawei","xiaomi","ios"
    //default 2 azure East Asia
    cloud = "azure";
    domain = 'https://reddah-ea.azurewebsites.net';
    storagePhoto = "https://reddah.blob.core.windows.net/photo/"
    storageCode = "https://reddah.blob.core.windows.net/code/"
    storageFile = "https://reddah.blob.core.windows.net/file/"

    initCurrentNetwork(){
        this.setCurrentNetwork(this.getCurrentNetwork());
    }

    networks = [
        {
            Id: 1, 
            Name:"Central US", 
            Speed: 0,
            cloud: "azure",
            domain: "https://reddah-cu.azurewebsites.net",
            storagePhoto: "https://reddah.blob.core.windows.net/photo/",
            storageCode: "https://reddah.blob.core.windows.net/code/",
            storageFile: "https://reddah.blob.core.windows.net/file/",
        },
        {
            Id: 2, 
            Name:"East Asia", 
            Speed: 0,
            cloud: "azure",
            domain: "https://reddah-ea.azurewebsites.net",
            storagePhoto: "https://reddah.blob.core.windows.net/photo/",
            storageCode: "https://reddah.blob.core.windows.net/code/",
            storageFile: "https://reddah.blob.core.windows.net/file/",
        },
    ]

    setCurrentNetwork(n){
        this.localStorageService.store("Reddah_Network", n);
        let currentNetwork = this.networks.filter(network=>network.Id==n)[0];
        if(currentNetwork==null){
            alert('Network not found');
            return;
        }

        this.cloud = currentNetwork.cloud;
        
        this.domain = currentNetwork.domain;
        this.storagePhoto = currentNetwork.storagePhoto;
        this.storageCode = currentNetwork.storageCode;
        this.storageFile = currentNetwork.storageFile;
        /*if//data center
        {
            this.cloud = "";
            //////DataCenter:Whois/////
            //default data center: whois
            this.domain = 'https://loging.reddah.com/';
            this.storagePhoto = "https://login.reddah.com/uploadPhoto/";
            //mini js,css,html
            this.storageCode = "https://login.reddah.com/uploadPhoto/";
            //vidio,audio,pdf,transfer temp files
            this.storageFile = "https://login.reddah.com/uploadPhoto/";
        }*/
    }

    getCurrentNetwork(){
        let network = this.localStorageService.retrieve("Reddah_Network");
        if(network==undefined||network==null)
            network = 2;
        return network;
    }

    cloudFix(cacheKey){
        if(cacheKey!=null)
        {
            if(this.cloud=="azure"){
                cacheKey = cacheKey
                    .replace("login.reddah.com/uploadPhoto",
                    "reddah.blob.core.windows.net/photo")
                    .replace("reddah.com/uploadPhoto",
                    "reddah.blob.core.windows.net/photo")
            }else{
                
            }

            return cacheKey
            .replace("///","https://")
            .replace("http://","https://")
        }
        return cacheKey;
    }


    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        
        private toastController: ToastController,
        private modalController: ModalController,
        private alertController: AlertController,
        private loadingController: LoadingController,
        private ngZone: NgZone,
        private sanitizer: DomSanitizer,
        //private imageResizer: ImageResizer
    ) { 
        
    }

    localeData;
    loadTranslate(locale){
        this.http.get<any>(`assets/i18n/${locale}.json`)
        .subscribe(res =>{
            this.localeData=this.flatten(res);
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

    isMobile(){
        return Capacitor.platform=="android"||Capacitor.platform=="ios";
    }

    isAndroid(){
        return Capacitor.platform=="android";
    }

    isIos(){
        return Capacitor.platform=="ios";
    }

    public Locales = [
        new Locale("zh-CN", "简体中文 (zh-CN)"),
        new Locale("en-US", "English (en-US)"),
        new Locale("es-ES", "Español (es-ES)"),
        new Locale("ar-AE", " عربي ، (ar-AE)"),
        new Locale("ru-RU", "Pусский язык (ru-RU)"),
        new Locale("pt-PT", "Português (pt-PT)"),
        new Locale("ja-JP", "日本語 (ja-JP)"),
        new Locale("de-DE", "Deutsch (de-DE)"),
        new Locale("fr-FR", "Français (fr-FR)"),
        new Locale("ko-KR", "한국어 (ko-KR)"),
        new Locale("it-IT", "Italiano (it-IT)"),
        new Locale("el-GR", "Ελληνικά (el-GR)"),
        new Locale("nl-NL", "Nederlands (nl-NL)"),
        new Locale("th-TH", "ภาษาไทย (th-TH)"),
        new Locale("zh-TW", "繁體中文 (zh-TW)"),
    ];

    getCurrentLocale(){
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        if(locale==undefined||locale==null)
            locale = "en-US";
        return locale;
    }

    clearLocaleCache(){
        
    }
}
