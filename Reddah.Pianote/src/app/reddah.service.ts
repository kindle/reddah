import { Inject, Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { AlertController, LoadingController, NavController, ModalController, ToastController, Platform } from '@ionic/angular';

import { fabric } from 'fabric';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, LocalNotifications,
    CameraPhoto, CameraSource, HapticsImpactStyle } from '@capacitor/core';
    
import { Locale } from './model/locale';
import { DOCUMENT } from '@angular/common';
import * as moment from 'moment';
    
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

    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,


        private toastController: ToastController,
        private modalController: ModalController,
        private alertController: AlertController,
        private loadingController: LoadingController,
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

    tfModel;

    isMobile(){
        return Capacitor.platform=="android"||Capacitor.platform=="ios";
    }

    isAndroid(){
        return Capacitor.platform=="android";
    }

    isIos(){
        return Capacitor.platform=="ios";
    }

    fixLocaleStr(str){
        let result = this.Locales.filter(l=>l.Name==str);
        if(result==null||result.length>0)
            return str;
            
        str = str.split('-')[0].toLowerCase();

        let match = this.Locales.filter(l=>l.Name.startsWith(str));
        if(match==null||match.length==0)
            return "";
        return match[0].Name;
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

    nonce_str() {
        return 'xxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 10 | 0, v = r;
            return v.toString(10);
        });
    }


    fix(num, length) {
        return ('' + num).length < length ? ((new Array(length + 1)).join('0') + num).slice(-length) : '' + num;
    }

    async Browser(u){
        await Browser.open({ url: u });
    }

    setBgm(bgm){
        this.localStorageService.store(`Reddah_Bgm`, bgm);
    }

    getBgm(){
        let bgm = this.localStorageService.retrieve(`Reddah_Bgm`);
        if(bgm ==null)
            bgm = true;
        return bgm;
    }


    async goFeedback() {
        let iosId = 1538301589;
        let storeAppURL = "";
        if(this.isIos()){
            storeAppURL = `itms-apps://itunes.apple.com/app/id${iosId}`;
            window.open(storeAppURL);
        }
        else if(this.isAndroid()){
            storeAppURL = "market://details?id=com.reddah.sudoku";
            this.Browser(storeAppURL);
        }
        else{
            storeAppURL = `https://apps.apple.com/cn/app/id${iosId}?l=${this.getCurrentLocale()}`;
            this.Browser(storeAppURL);
        }
    }

    checkGoFeedback(task){
        //console.log(task);
        return task.id>0&&(task.id%10==0)&&this.getFeedback();
    }

    getFeedback(){
        let feedback = this.localStorageService.retrieve(`Reddah_Feedback`);
        return feedback==null;
    }


    setFeedback(){
        this.localStorageService.store(`Reddah_Feedback`, 'done');
    }

    isTestPass(){
        let pass = this.localStorageService.retrieve(`Reddah_TestPass`);
        return pass=='pass';
    }

    setTestPass(){
        this.localStorageService.store(`Reddah_TestPass`, 'pass');
    }

    getIsPencil(){
        let isPencil = this.localStorageService.retrieve(`Reddah_IsPencil`);
        return isPencil===true;
    }

    setPencil(value){
        this.localStorageService.store(`Reddah_IsPencil`, value);
    }

    async toast(type, n, style="toast-style") {
        const toast = await this.toastController.create({
            message: `${this.instant("Coins")}: ${type}${n}`,
            position: "top",
            duration: 2000,
            color: 'primary',
            cssClass: style,
        });
        toast.present();
    }





    records = [];
    getRecords(){
        let result = this.localStorageService.retrieve(`Reddah_Records`);
        return result;
    }

    setRecords(){
        this.localStorageService.store(`Reddah_Records`, this.records);
    }

    private isInit(){
        let initialized = this.localStorageService.retrieve(`Reddah_Init`);
        return initialized == 'done';
    }

    private setInit(){
        this.localStorageService.store(`Reddah_Init`, 'done');
    }

    init(){
        if(!this.isInit()){
            this.records = this.getRecords();
            if(this.records==null||this.records.length==0){
                this.records = [];
                this.records.push(
                {
                    name: 'Mary had a little lamb',
                    speed: 80,
                    beat: 4,
                    note: 4,
                    create: Date.now(),
                });

                this.records.push(
                {
                    name: '滑稽面孔',
                    speed: 96,
                    beat: 3,
                    note: 4,
                    create: Date.now()+1,
                });

                this.records.push(
                {
                    name: '菊次郎の夏',
                    speed: 88,
                    beat: 4,
                    note: 4,
                    create: Date.now()+2,
                });
                
                this.setRecords();
                this.setInit();
            }
        }
        else{
            this.records = this.getRecords();
        }
    }

    utcToLocal(str, format="YYYY-MM-DD HH:mm:ss"){
        let localTime = moment.utc(str).toDate();
        return moment(localTime).format(format).toString();
    }







  pathTrebleClef = "M16.741,7.01L17.958,12.932C18.022,13.284 18.054,13.604 18.054,13.924C18.054,17.061 14.853,19.686 11.396,19.686C10.339,19.686 9.315,19.43 8.355,18.95C10.819,18.694 12.676,17.189 12.676,14.981C12.676,13.028 11.075,10.979 9.027,10.979C6.69,10.979 5.09,12.772 5.09,15.109C5.09,18.374 7.746,20.518 10.947,20.518C15.237,20.518 18.886,17.734 18.886,13.732C18.886,12.836 17.478,6.498 17.51,6.722C20.935,5.058 23.271,2.113 23.271,-0.992C23.271,-5.25 19.846,-8.515 15.589,-8.515C15.525,-8.515 15.077,-8.483 14.309,-8.419L12.9,-15.173C17.67,-19.206 19.846,-23.495 19.846,-28.201C19.846,-31.818 18.406,-35.659 15.493,-39.693C12.196,-37.036 10.307,-31.722 10.307,-26.056C10.307,-24.04 10.563,-22.087 11.011,-20.23C3.713,-14.116 0.064,-8.483 0.064,-3.329C0.064,2.721 6.306,7.746 13.092,7.746C14.597,7.746 15.717,7.522 16.741,7.01ZM16.645,-35.051C17.702,-33.963 18.246,-32.682 18.246,-31.178C18.246,-28.073 16.037,-24.584 11.716,-20.743C11.492,-21.671 11.428,-22.695 11.428,-23.816C11.428,-29.193 13.412,-35.115 16.069,-35.115C16.293,-35.115 16.485,-35.083 16.645,-35.051ZM17.317,5.698L15.045,-4.994C15.493,-5.026 15.749,-5.058 15.845,-5.058C18.598,-5.058 20.518,-2.465 20.518,0.192C20.518,2.305 19.398,4.161 17.317,5.698ZM14.244,-4.866L16.549,6.146C15.429,6.754 14.18,7.01 12.676,7.01C7.49,7.01 3.009,3.137 3.009,-1.568C3.009,-5.826 6.178,-10.211 12.164,-14.693L13.508,-8.291C10.179,-7.586 7.362,-4.77 7.362,-1.601C7.362,1.088 9.283,2.977 12.164,3.425C10.403,2.337 9.539,0.96 9.539,-0.672C9.539,-2.881 11.588,-4.513 14.244,-4.866Z";
  pathBaseClef = "M0.288,17.67C0.32,18.15 0.64,18.406 1.312,18.406C3.937,18.406 11.236,14.789 14.309,9.859C16.773,5.954 17.478,3.937 17.478,1.28C17.478,-2.977 15.525,-8.131 8.003,-8.131C3.905,-8.131 0.192,-5.25 0.192,-1.472C0.192,0.992 1.504,3.105 3.521,3.105C5.538,3.105 6.914,1.568 6.914,-0.448C6.914,-1.889 5.826,-3.201 4.417,-3.201C3.105,-3.201 2.113,-2.177 2.209,-2.177C2.049,-2.177 1.985,-2.337 1.985,-2.689C1.985,-4.93 4.802,-7.106 7.394,-7.106C11.043,-7.106 13.348,-4.065 13.348,0C13.348,5.058 10.403,10.659 5.698,14.885C4.449,16.005 2.625,16.933 0.288,17.67ZM20.166,-4.001C20.166,-3.105 20.871,-2.401 21.767,-2.401C22.663,-2.401 23.367,-3.105 23.367,-4.001C23.367,-4.898 22.663,-5.602 21.767,-5.602C20.871,-5.602 20.166,-4.898 20.166,-4.001ZM20.166,3.969C20.166,4.866 20.871,5.57 21.767,5.57C22.663,5.57 23.367,4.866 23.367,3.969C23.367,3.073 22.663,2.369 21.767,2.369C20.871,2.369 20.166,3.073 20.166,3.969Z";
  pathQuarterRest = "M8.419,6.37C7.106,4.257 4.417,1.921 4.417,0.224C4.417,-0.896 5.41,-2.657 7.426,-5.09L1.729,-12.9C1.376,-12.836 1.184,-12.708 1.184,-12.484C1.184,-12.516 3.521,-9.699 3.521,-8.003C3.521,-6.338 2.433,-4.513 0.224,-2.497C2.721,0.576 4.129,2.049 5.122,3.585C4.449,3.233 3.809,3.041 3.201,3.041C1.248,3.041 0,4.898 0,6.786C0,9.091 3.841,11.876 4.577,11.876C4.705,11.876 4.802,11.812 4.834,11.684C3.489,10.371 2.817,9.155 2.817,8.035C2.817,6.562 4.065,5.73 5.698,5.73C6.562,5.73 7.49,5.954 8.419,6.37Z";
  pathSharp = "M5.538,2.241L2.465,3.265L2.465,-2.273L5.538,-3.297L5.538,2.241ZM5.538,-11.011L5.538,-6.21L2.465,-5.186L2.465,-9.987L1.665,-9.987L1.665,-4.962L0,-4.417L0,-1.504L1.665,-2.049L1.665,3.489L0,4.033L0,6.946L1.665,6.402L1.665,10.979L2.465,10.979L2.465,6.178L5.538,5.154L5.538,9.955L6.338,9.955L6.338,4.93L8.003,4.385L8.003,1.472L6.338,2.017L6.338,-3.521L8.003,-4.065L8.003,-6.978L6.338,-6.434L6.338,-11.011L5.538,-11.011Z";
  pathFlat = "M0,5.858L4.513,2.529C6.498,1.088 7.266,-0.544 7.33,-1.761C7.33,-3.553 5.698,-4.898 3.777,-4.898C2.433,-4.898 1.44,-4.385 0.8,-3.329L1.024,-13.412L0,-13.412L0,5.858ZM2.977,-3.617C4.001,-3.617 4.77,-2.881 4.77,-1.889C4.77,-0.224 2.561,2.977 0.896,4.033C0.8,3.489 0.736,2.433 0.736,0.864C0.736,0 0.8,-1.056 0.928,-2.273C1.408,-3.169 2.081,-3.617 2.977,-3.617Z";
  pathHollowHead = "M0,1.472C0,3.265 1.761,4.321 3.937,4.321C7.586,4.321 11.268,1.889 11.268,-1.12C11.268,-3.169 9.539,-4.353 6.882,-4.353C3.617,-4.353 0,-1.472 0,1.472ZM8.707,-3.393C9.923,-3.393 10.531,-2.881 10.531,-1.889C10.531,-0.032 4.834,3.361 2.561,3.361C1.344,3.361 0.736,2.849 0.736,1.857C0.736,-0.128 6.658,-3.393 8.707,-3.393Z";
  pathSolidHead = "M3.585,4.161C6.882,4.161 10.947,1.408 10.947,-1.408C10.947,-3.105 9.443,-4.193 7.298,-4.193C4.065,-4.193 0,-1.504 0,1.376C0,3.137 1.568,4.161 3.585,4.161Z";
  pathNoteStemUp = "M0 0 L0,42";
  pathNoteStemDown = "M125.068,167.053L125.068,193.811";
  pathNoteTail = "M0.32,0C1.921,0 2.465,0.608 3.393,1.28C5.986,3.105 7.298,5.122 7.298,7.362L7.298,7.522C7.234,10.403 7.202,10.627 6.37,12.484C6.242,12.772 6.178,12.964 6.178,13.092C6.178,13.252 6.274,13.348 6.434,13.348C6.754,13.348 8.387,11.108 8.387,7.01L8.387,6.85C8.387,5.474 8.003,4.161 7.234,2.945C7.01,2.561 6.018,1.248 4.257,-0.96C2.881,-2.721 1.697,-4.898 0.736,-7.426C0.704,-7.522 0.704,-7.618 0.704,-7.714C0.704,-7.81 0.704,-7.906 0.736,-7.971C0.768,-8.003 0.608,-8.003 0.32,-8.003L0.32,0Z";
  pathNoteTwoTails = "M7.074,16.485C7.714,16.485 8.611,13.732 8.611,12.548L8.611,12.388C8.579,11.428 8.483,10.691 8.259,10.147C8.611,9.443 8.771,8.515 8.771,7.33C8.771,5.698 8.323,4.001 7.362,2.721C6.37,1.408 5.218,0.288 4.289,-0.992C2.465,-3.233 1.28,-5.41 0.736,-7.426C0.64,-7.81 0.672,-8.003 0.416,-8.003L0.32,-8.003L0.32,6.082C1.472,6.082 1.761,6.21 3.393,7.458C6.786,10.115 7.394,10.819 7.458,12.356C7.458,13.508 6.818,15.749 6.818,16.229C6.818,16.389 6.914,16.485 7.074,16.485ZM7.682,7.842C7.682,8.131 7.682,8.419 7.65,8.739C7.106,7.65 4.513,5.346 4.257,5.026C3.137,3.649 2.209,2.049 1.408,0.224C3.041,0.736 6.274,3.937 6.402,4.097C7.266,5.154 7.682,6.402 7.682,7.842Z";

  quarterRest = ()=>{
    return new fabric.Path(this.pathQuarterRest, {
        fill: 'none',
        stroke: '#000000',
        strokeMiterLimit: 10,
        opacity: 1,
        left: 0, 
        top: 0, 
    });
  }

  hollowHead = ()=>{
    return new fabric.Path(this.pathHollowHead, {
        fill: 'none',
        stroke: '#000000',
        strokeMiterLimit: 10,
        opacity: 1,
        left: 0, 
        top: 39,
    });
  }

  solidHead = ()=>{
    return new fabric.Path(this.pathSolidHead, {
        fill: 'none',
        stroke: '#000000',
        strokeMiterLimit: 10,
        opacity: 1,
        left: 0, 
        top: 39,
    })
  };


  stem0 = ()=>{
    return new fabric.Path(this.pathNoteStemUp, {
        fill: 'none',
        stroke: 'transparent',
        strokeMiterLimit: 10,
        opacity: 1,
        left: 11, 
        top: 0, 
    });
  }

  stem = ()=>{
    return new fabric.Path(this.pathNoteStemUp, {
        fill: 'none',
        stroke: '#000000',
        strokeMiterLimit: 10,
        opacity: 1,
        left: 11, 
        top: 0, 
    });
  }

  tail = ()=>{
    return new fabric.Path(this.pathNoteTail, {
        fill: 'none',
        stroke: '#000000',
        strokeMiterLimit: 10,
        opacity: 1,
        left: 11, 
        top: 0, 
    });
  }

  twoTails = ()=>{
    return new fabric.Path(this.pathNoteTwoTails, {
        fill: 'none',
        stroke: '#000000',
        strokeMiterLimit: 10,
        opacity: 1,
        left: 11, 
        top: 0, 
    });
  }

  f = new Map()
    .set(-4,196.00)
    .set(-5,196.00)
    .set(-6,220.00)
    .set(-7,246.94)
    .set(1,261.63)
    .set(2,293.66)
    .set(3,329.63)
    .set(4,349.23)
    .set(5,392.00)  
    .set(6,440.00)
    .set(7,493.88)
    .set(8,523.25)
    .set(9,587.33)
    .set(10,659.25)
    .set(11,698.46)

}
