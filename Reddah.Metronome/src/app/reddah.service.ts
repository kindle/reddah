import { Inject, Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { AlertController, LoadingController, NavController, ModalController, ToastController, Platform } from '@ionic/angular';

import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, LocalNotifications,
    CameraPhoto, CameraSource, HapticsImpactStyle } from '@capacitor/core';
    
import { Locale } from './model/locale';
import { DOCUMENT } from '@angular/common';
import * as moment from 'moment';
import { fabric } from 'fabric';
    
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
    pathBaseClef = "M 6.8 -8.15 L 4.75 -7 Q 4 -6.2 3.55 -5.2 Q 3.1 -4.2 4.5 -3.9 L 6.1 -4.25 Q 7.75 -4.35 8.8 -3.4 Q 9.9 -2.4 9.95 -1 Q 9.9 0.4 8.85 1.5 Q 7.8 2.6 5.9 2.65 Q 3.9 2.65 2.5 1.45 Q 1.15 0.3 1.05 -1.55 Q 1 -3.6 2.15 -5.45 Q 3.3 -7.25 5.25 -8.35 Q 6.35 -9 8 -9.5 L 10.9 -10 Q 14.7 -10.25 18.25 -7.5 Q 20.05 -6.05 20.85 -4.5 Q 21.6 -2.95 21.85 -0.5 Q 22.1 3.2 19.8 7.2 Q 17.55 11.15 14.5 13.65 L 7.85 18.05 L 0.25 22 L 0 21.15 L 7.85 15.65 Q 11.1 13.05 13.65 8.75 Q 14.8 6.75 15.5 4.25 Q 16.25 1.8 16.25 -0.35 Q 16.4 -3.55 15.3 -5.75 Q 14.55 -7.15 13.1 -8 Q 11.55 -8.9 9.55 -8.75 L 6.8 -8.15 M 25.65 -6.85 Q 27.7 -6.6 27.8 -4.7 Q 27.7 -2.75 25.65 -2.5 Q 23.5 -2.75 23.45 -4.7 Q 23.5 -6.6 25.65 -6.85 M 27.8 4.05 Q 27.7 6 25.65 6.25 Q 23.5 6 23.45 4.05 Q 23.5 2.15 25.65 1.9 Q 27.7 2.15 27.8 4.05";
    
    pathCClef = "M12.098,3.484C10.549,5.581 9.065,6.646 7.678,6.646C5.226,6.646 3.516,2.968 3.516,-0.71C3.516,-4.291 5.065,-6.839 7.646,-6.839C8.033,-6.839 8.452,-6.775 8.872,-6.678C8.065,-5.936 7.678,-5.194 7.678,-4.452C7.678,-3.323 8.807,-2.484 9.968,-2.484C11.033,-2.484 12.001,-3.323 12.001,-4.452C12.001,-6.355 9.614,-7.581 6.871,-7.581C2.71,-7.581 0,-4.549 0,-0.29C0,4.097 2.903,7.517 7.065,7.517C9.162,7.517 11.581,5.452 12.098,3.484Z";
    
    pathEndClef = "M1.6,-54.6L1.6,0L0,0L0,-54.6L1.6,-54.6M10.4,-54.6L10.4,0L4.4,0L4.4,-54.6L10.4,-54.6";
  
  
    path1 = "M 8.05 -8 L 8.05 5.1 Q 8.05 6.3 8.4 6.95 Q 8.75 7.6 10.1 7.65 L 10.1 8.9 L 1.65 8.9 L 1.65 7.65 Q 3 7.6 3.35 6.95 Q 3.7 6.3 3.7 5.1 L 3.7 -3.35 L 3.65 -3.35 L 1 1 L 0 0.6 L 3.65 -8 L 8.05 -8";
    path2 = "M 4.65 -4.65 Q 5.65 -4.25 5.8 -2.75 Q 5.75 -1.75 4.95 -1.1 Q 4.15 -0.4 3.15 -0.4 Q 0.7 -0.65 0.45 -3 Q 0.45 -4.95 2.05 -6.45 Q 3.65 -7.9 7.45 -8 Q 10.35 -7.9 11.8 -6.4 Q 13.3 -4.95 13.3 -3.05 Q 12.95 0.15 9.85 1.3 Q 6.8 2.4 4.55 3.95 L 4.55 4 Q 8.05 3.6 10.1 5.05 L 11.5 5.15 Q 12.25 4.85 12.35 3.15 L 13.6 3.15 Q 13.65 5.3 12.85 7.3 Q 12 9.35 9.45 9.5 Q 7.65 9.3 6.5 8.25 Q 5.35 7.1 3.8 6.8 Q 1.7 6.9 1.4 8.9 L 0.1 8.9 Q -0.35 6.15 1.7 4.45 Q 3.75 2.75 5.85 1.65 Q 7.15 0.85 8.05 -0.4 Q 9 -1.7 9.05 -3.3 Q 8.95 -6.85 6.15 -6.6 Q 3.45 -6.55 3.55 -5.55 Q 3.7 -5 4.65 -4.65";
    path3 = "M 4.6 -5.2 Q 5.2 -4.9 5.3 -3.45 Q 5.1 -1.5 2.75 -1.35 Q 0.5 -1.5 0.35 -3.8 Q 0.5 -6.25 2.6 -7.1 Q 4.65 -8 6.4 -8 Q 8.45 -8.1 10.55 -6.95 Q 12.65 -5.8 12.75 -3.3 Q 12.7 -0.5 8.65 0.45 L 8.65 0.5 Q 10.2 0.65 11.55 1.6 Q 12.85 2.55 12.9 4.4 Q 12.8 7.25 10.65 8.4 Q 8.6 9.55 6.25 9.5 Q 4.25 9.55 2.25 8.7 Q 0.2 7.85 0 5.5 Q 0.25 3.1 2.65 2.85 Q 4.95 3.05 5.15 5.3 Q 4.95 6.4 4.3 7.2 Q 4.4 8.2 5.3 8.25 Q 6.8 8.35 7.7 7.35 Q 8.65 6.4 8.7 4.85 Q 8.6 2.65 7.2 1.85 Q 5.85 1.05 4 1.05 L 4 -0.2 Q 6.2 -0.2 7.25 -0.9 Q 8.4 -1.6 8.4 -3.55 Q 8.35 -6.6 5.6 -6.75 L 4.5 -6.6 Q 3.95 -6.5 3.85 -5.95 Q 4 -5.5 4.6 -5.2";
    path4 = "M 6.35 -2.3 Q 3.7 0.95 1.55 2.75 L 1.55 2.85 L 6.9 2.85 L 6.9 -0.6 L 11.25 -4.7 L 11.25 2.85 L 13.2 2.85 L 13.2 4.25 L 11.25 4.25 L 11.25 5 Q 11.2 6.2 11.55 6.85 Q 11.9 7.5 13.15 7.55 L 13.15 8.8 L 4.9 8.8 L 4.9 7.55 Q 6.2 7.5 6.55 6.85 Q 6.9 6.2 6.9 5 L 6.9 4.25 L 0 4.25 L 0 2.85 Q 2.2 0.75 3.2 -2.15 Q 4.3 -5.1 4.6 -8 L 10.45 -8 Q 9.05 -5.55 6.35 -2.3";
    path5 = "M 8.7 -5 Q 7.35 -4.15 5.3 -4.2 L 1.9 -4.65 L 1.8 -0.85 Q 3.8 -2.15 6.1 -2.15 Q 8.6 -2.1 10.3 -0.75 Q 12 0.5 12.1 3.1 Q 12.1 5 10.5 6.9 Q 8.8 8.75 4.95 8.9 Q 3.2 8.9 1.65 7.95 Q 0.15 7.05 0 5.2 Q -0.1 4.05 0.6 3.15 Q 1.3 2.25 2.3 2.2 Q 4.9 2.2 4.9 4.8 Q 4.8 5.75 4 6.35 Q 3.7 6.5 3.65 6.9 Q 3.95 7.75 4.95 7.65 Q 5.9 7.75 7.1 6.65 Q 8.3 4.95 8 2.85 Q 7.9 1.2 7 0.15 Q 6.05 -0.85 4.85 -0.9 Q 3 -0.85 1.65 0.75 L 0.55 0.75 L 0.7 -8 L 5.7 -7.45 L 10.6 -8 Q 10.15 -5.8 8.7 -5";
    pathFermata = "M19.206,0C19.206,-6.978 15.397,-12.036 9.603,-12.036C3.809,-12.036 0,-6.85 0,0L0.512,0C0.832,0 1.28,-3.169 1.28,-3.265C2.337,-6.786 5.826,-9.155 9.795,-9.155C13.38,-9.155 16.997,-6.85 17.99,-3.329C18.406,-1.793 18.47,0.032 18.758,0L19.206,0ZM8.259,-1.985C8.259,-1.248 8.867,-0.64 9.603,-0.64C10.339,-0.64 10.947,-1.248 10.947,-1.985C10.947,-2.721 10.339,-3.329 9.603,-3.329C8.867,-3.329 8.259,-2.721 8.259,-1.985Z";
  
    path64Rest = "M12.1,-13.6Q10.65,-13.65 9.5,-14.55Q8.4,-15.45 8.35,-16.9Q8.4,-19.3 10.8,-19.95Q12.1,-20.15 13,-19.3Q13.9,-18.5 13.95,-17.2L13.75,-16.2L13.6,-15.75Q13.9,-15.1 14.6,-15.45Q17,-16.55 18.2,-18.85L18.9,-18.85L5.75,28.5L4.35,28.5L8.1,14.9Q6.1,16.2 3.8,16.4Q2.3,16.35 1.2,15.45Q0.1,14.55 0,13.1Q0.15,10.3 2.95,10Q5.45,10.35 5.6,12.85L5.3,14.4Q5.45,14.7 5.8,14.65Q6.5,14.65 7.35,14L8.7,12.8L10.85,4.9Q8.8,6.2 6.45,6.4Q5,6.35 3.85,5.45Q2.75,4.55 2.7,3.15Q2.8,0.35 5.65,0.05Q6.85,0.15 7.6,1.05Q8.35,1.95 8.3,3.1L8,4.4Q8.15,4.7 8.5,4.65Q9.25,4.7 10.1,4L11.45,2.65L13.65,-5.1Q11.6,-3.8 9.3,-3.6Q7.8,-3.65 6.65,-4.55Q5.55,-5.45 5.5,-6.9Q5.55,-9.3 8,-9.95Q9.25,-10.1 10.15,-9.3Q11.1,-8.45 11.1,-7.2L10.95,-6.15L10.8,-5.75Q11.1,-5.1 11.8,-5.45Q13.15,-5.9 14.25,-7.25L16.45,-15.1Q14.45,-13.8 12.1,-13.6";
    path32Rest = "M10.9,-16.2L10.75,-15.75Q11.05,-15.1 11.75,-15.45Q14.1,-16.55 15.4,-18.85L16.1,-18.85L5.75,18.5L4.35,18.5L8.15,4.85Q6.1,6.15 3.8,6.35Q2.3,6.3 1.2,5.4Q0.1,4.5 0,3.05Q0.15,0.25 2.95,-0.05Q5.45,0.3 5.6,2.8L5.3,4.35Q5.45,4.65 5.8,4.6Q6.55,4.6 7.4,3.95L8.75,2.75L10.8,-5.1Q8.75,-3.8 6.45,-3.6Q5,-3.65 3.85,-4.55Q2.75,-5.45 2.7,-6.85Q2.8,-9.65 5.65,-9.95Q6.85,-9.85 7.6,-8.95Q8.3,-8.05 8.25,-6.9L7.95,-5.6Q8.1,-5.3 8.45,-5.35Q9.2,-5.3 10.05,-6L11.4,-7.35L13.6,-15.1Q11.55,-13.8 9.25,-13.6Q7.8,-13.65 6.65,-14.55Q5.55,-15.45 5.5,-16.9Q5.55,-19.3 7.95,-19.95Q9.2,-20.15 10.1,-19.3Q11.05,-18.5 11.05,-17.2Q11.15,-16.65 10.9,-16.2";
    path16Rest = "M11.78,-5.378C9.699,-3.937 8.227,-3.233 7.362,-3.233C7.17,-3.233 6.978,-3.265 6.818,-3.297C7.138,-3.905 7.298,-4.481 7.298,-4.962C7.298,-6.018 6.722,-6.53 5.57,-6.53C4.385,-6.53 3.329,-5.794 3.329,-4.641C3.329,-3.265 4.321,-2.593 6.338,-2.593C7.49,-2.593 8.803,-2.849 10.307,-3.393L7.042,3.873C5.73,4.353 4.866,4.609 4.449,4.609C4.225,4.609 3.969,4.609 3.745,4.577C4.065,3.969 4.225,3.457 4.225,2.977C4.225,1.985 3.617,1.472 2.433,1.472C1.216,1.472 0.032,2.209 0.032,3.265C0.032,4.737 1.024,5.474 2.977,5.474C4.193,5.474 5.442,5.218 6.69,4.673L2.017,15.173L3.489,15.173L11.78,-5.378Z";
    path8Rest = "M8.483,-5.25C6.85,-3.809 5.314,-3.105 3.937,-3.105C3.745,-3.105 3.617,-3.137 3.521,-3.201C3.873,-3.841 4.033,-4.385 4.033,-4.866C4.033,-5.922 3.425,-6.434 2.209,-6.434C1.152,-6.434 0,-5.73 0,-4.802C0,-3.233 0.992,-2.465 2.977,-2.465C4.065,-2.465 5.442,-2.753 7.106,-3.297L1.985,7.971L3.329,7.971L8.483,-5.25Z";
    pathQuarterRest = "M8.419,6.37C7.106,4.257 4.417,1.921 4.417,0.224C4.417,-0.896 5.41,-2.657 7.426,-5.09L1.729,-12.9C1.376,-12.836 1.184,-12.708 1.184,-12.484C1.184,-12.516 3.521,-9.699 3.521,-8.003C3.521,-6.338 2.433,-4.513 0.224,-2.497C2.721,0.576 4.129,2.049 5.122,3.585C4.449,3.233 3.809,3.041 3.201,3.041C1.248,3.041 0,4.898 0,6.786C0,9.091 3.841,11.876 4.577,11.876C4.705,11.876 4.802,11.812 4.834,11.684C3.489,10.371 2.817,9.155 2.817,8.035C2.817,6.562 4.065,5.73 5.698,5.73C6.562,5.73 7.49,5.954 8.419,6.37Z";
    pathHalfRest = "M12.627,0L-0.023,0L-0.023,-5L12.627,-5L12.627,0";
    pathWholeRest = "M12.627,5L-0.023,5L-0.023,0L12.627,0L12.627,5";
    
    
    pathHollowHead = "M0,1.472C0,3.265 1.761,4.321 3.937,4.321C7.586,4.321 11.268,1.889 11.268,-1.12C11.268,-3.169 9.539,-4.353 6.882,-4.353C3.617,-4.353 0,-1.472 0,1.472ZM8.707,-3.393C9.923,-3.393 10.531,-2.881 10.531,-1.889C10.531,-0.032 4.834,3.361 2.561,3.361C1.344,3.361 0.736,2.849 0.736,1.857C0.736,-0.128 6.658,-3.393 8.707,-3.393Z";
    pathSolidHead = "M 13 -1.55 Q 12.8 1.2 10.15 3.15 Q 7.4 5.1 4.4 5.2 Q 2.5 5.15 1.3 4.2 Q 0.05 3.15 0 1.45 Q 0.2 -1.15 2.85 -3.1 Q 5.45 -5.1 8.25 -5.2 Q 10.45 -5.25 11.65 -4.3 Q 12.95 -3.45 13 -1.55";
    //pathNoteStem = "M0 0 L0,42";
    pathNoteStem = "M0 0 H 1 V 49 H 0 Z";
  
    pathTailUp1 = "M 9.65 19.45 Q 9.6 22.6 8.45 25.45 L 6.2 30 L 5.6 30 L 7.35 25.85 Q 8.3 23.35 8.3 20.5 Q 8.15 17.1 6.05 14.4 Q 4.9 12.9 3.2 11.9 Q 1.5 10.9 -0.2 10.7 L -0.2 11.5 L -1.25 11.5 L -1.25 0 L -0.2 0 L 0.35 3.3 Q 0.7 5.15 2.2 7.05 L 6.8 12.25 Q 9.45 15.45 9.65 19.45";
    pathTailDown1 = "M 7.5 -28.25 Q 8.6 -26.5 9.7 -23.7 Q 10.85 -20.85 10.9 -17.7 Q 10.7 -13.7 8.05 -10.5 L 3.45 -5.3 Q 1.95 -3.4 1.6 -1.55 L 1.05 1.75 L 0 1.75 L 0 -9.75 L 1.05 -9.75 L 1.05 -8.95 Q 2.75 -9.15 4.45 -10.15 Q 6.15 -11.15 7.3 -12.65 Q 9.4 -15.35 9.55 -18.75 Q 9.55 -21.65 8.65 -24.05 L 6.9 -28 L 7.5 -28.25";
    pathTailUp2 = "M7.074,16.485C7.714,16.485 8.611,13.732 8.611,12.548L8.611,12.388C8.579,11.428 8.483,10.691 8.259,10.147C8.611,9.443 8.771,8.515 8.771,7.33C8.771,5.698 8.323,4.001 7.362,2.721C6.37,1.408 5.218,0.288 4.289,-0.992C2.465,-3.233 1.28,-5.41 0.736,-7.426C0.64,-7.81 0.672,-8.003 0.416,-8.003L0.32,-8.003L0.32,6.082C1.472,6.082 1.761,6.21 3.393,7.458C6.786,10.115 7.394,10.819 7.458,12.356C7.458,13.508 6.818,15.749 6.818,16.229C6.818,16.389 6.914,16.485 7.074,16.485ZM7.682,7.842C7.682,8.131 7.682,8.419 7.65,8.739C7.106,7.65 4.513,5.346 4.257,5.026C3.137,3.649 2.209,2.049 1.408,0.224C3.041,0.736 6.274,3.937 6.402,4.097C7.266,5.154 7.682,6.402 7.682,7.842Z";
    pathTailDown2 = "M9.1,-29.6L9.55,-30Q11.2,-27.55 11.4,-23.3Q11.45,-21.1 10.45,-19.25Q10.9,-18.1 10.9,-16.45Q10.95,-14.4 10.25,-11.95Q9.5,-9.5 7.8,-7.25Q6,-5.05 3.1,-2.6Q1.9,-1.4 1.5,-0.2L1.05,1.4L0,1.4L0,-14.35L1.05,-14.35L1.05,-13.55L5.25,-16.15Q7.6,-17.6 8.9,-19.05Q9.85,-20.25 10.15,-21.4L10.45,-24.1Q10.5,-25.65 10,-27.35L9.1,-29.6M8.7,-16.45L7,-14.55L4.7,-12.35Q3.4,-11.15 2.3,-9.2Q1.2,-7.2 1.05,-5Q3.75,-6.45 5.75,-8.05Q7.75,-9.7 9.05,-12.6L9.75,-14.7L10,-16.65L10,-18.5L8.7,-16.45";
    pathTailUp3 = "M1.85,-3.5Q4.9,-0.9 6.85,1.5Q9.5,4.65 9.65,8.7Q9.65,10.95 9.05,13.05Q9.6,14.65 9.65,16.45Q9.65,18.45 9.05,20.4Q10.1,22.45 10.15,24.85Q10,29.05 8.1,31.9L7.45,31.9L8.7,29Q9.25,27.2 9.2,25.65L8.9,23Q8.6,21.85 7.6,20.6Q6.3,19.15 3.95,17.75L-0.2,15.15L-0.2,15.95L-1.25,15.95L-1.25,-8.5L-0.2,-8.5L0.2,-6.05Q0.6,-4.7 1.85,-3.5M6.1,3.65Q3.5,0.75 -0.2,-1.15L-0.2,-0.7L0.2,1.75Q0.6,3.05 1.85,4.25Q4.9,6.9 6.85,9.25Q7.9,10.5 8.55,11.85L8.6,10.85L8.6,9.1Q8.3,6.05 6.1,3.65M8.6,16.85Q8.3,13.8 6.1,11.4Q3.5,8.55 -0.2,6.6Q-0.05,8.8 1.05,10.8Q2.15,12.75 3.5,14L5.85,16.15L7.55,18.05L8.5,19.45L8.6,16.85";
    pathTailDown3 = "M9.1,-29.6L9.55,-30Q11.2,-27.55 11.4,-23.3Q11.45,-21.1 10.45,-19.25Q10.9,-18.1 10.9,-16.45Q10.95,-14.75 10.45,-12.7Q10.85,-11.5 10.9,-9.8Q10.95,-7.8 10.25,-5.35Q9.5,-2.9 7.8,-0.7Q6,1.5 3.1,3.95Q1.85,5.2 1.5,6.35L1.05,7.95L0,7.95L0,-14.35L1.05,-14.35L1.05,-13.55L5.25,-16.15Q7.6,-17.6 8.9,-19.05Q9.85,-20.25 10.15,-21.4L10.45,-24.1Q10.5,-25.65 10,-27.35L9.1,-29.6M10,-16.65L10,-18.5L8.7,-16.45L7,-14.55L4.7,-12.35Q3.4,-11.15 2.3,-9.2Q1.2,-7.2 1.05,-5Q3.75,-6.45 5.75,-8.05Q7.75,-9.7 9.05,-12.6L9.75,-14.7L10,-16.65M10.05,-11.35Q9.3,-9.2 7.8,-7.25Q6,-5.05 3.1,-2.6Q1.9,-1.4 1.5,-0.2L1.05,1.4L1.05,1.6Q3.75,0.15 5.75,-1.5Q7.75,-3.1 9.05,-5.95L9.75,-8.1L10,-10.05L10.05,-11.35";
    pathTailUp4 = "M1.85,-11Q4.9,-8.4 6.85,-6Q9.5,-2.85 9.65,1.2Q9.65,3.45 9,5.6Q9.6,7.2 9.65,9.05Q9.65,11.3 9.05,13.4Q9.6,15 9.65,16.8Q9.65,18.8 9.05,20.75Q10.1,22.8 10.15,25.15Q10,29.35 8.1,32.2L7.45,32.2L8.7,29.3Q9.25,27.5 9.2,25.95L8.9,23.35Q8.6,22.2 7.6,20.95Q6.3,19.5 3.95,18.1L-0.2,15.5L-0.2,16.3L-1.25,16.3L-1.25,-16L-0.2,-16L0.2,-13.55Q0.6,-12.2 1.85,-11M1.85,-3.15Q4.9,-0.55 6.85,1.85L8.55,4.45L8.6,3.35L8.6,1.6Q8.3,-1.45 6.1,-3.85Q3.5,-6.75 -0.2,-8.65L-0.2,-8.15L0.2,-5.7Q0.6,-4.35 1.85,-3.15M1.85,4.6Q4.9,7.25 6.85,9.6Q7.9,10.85 8.55,12.2L8.6,11.2L8.6,9.45Q8.3,6.4 6.1,4Q3.5,1.1 -0.2,-0.8L-0.2,-0.35L0.2,2.1Q0.6,3.4 1.85,4.6M8.6,17.2Q8.3,14.15 6.1,11.75Q3.5,8.9 -0.2,6.95Q-0.05,9.15 1.05,11.15Q2.15,13.1 3.5,14.35L5.85,16.5L7.55,18.4L8.5,19.8L8.6,17.2";
    pathTailDown4 = "M9.1,-29.6L9.55,-30Q11.2,-27.55 11.4,-23.3Q11.45,-21.1 10.45,-19.25Q10.9,-18.1 10.9,-16.45Q10.95,-14.75 10.45,-12.7Q10.85,-11.5 10.9,-9.8Q10.95,-8.2 10.5,-6.25L10.9,-3.45Q10.95,-1.45 10.25,1Q9.5,3.45 7.8,5.65Q6,7.85 3.1,10.3Q1.85,11.55 1.5,12.7L1.05,14.3L0,14.3L0,-14.35L1.05,-14.35L1.05,-13.55L5.25,-16.15Q7.6,-17.6 8.9,-19.05Q9.85,-20.25 10.15,-21.4L10.45,-24.1Q10.5,-25.65 10,-27.35L9.1,-29.6M9.75,-14.7L10,-16.65L10,-18.5L8.7,-16.45L7,-14.55L4.7,-12.35Q3.4,-11.15 2.3,-9.2Q1.2,-7.2 1.05,-5Q3.75,-6.45 5.75,-8.05Q7.75,-9.7 9.05,-12.6L9.75,-14.7M10.05,-11.35Q9.3,-9.2 7.8,-7.25Q6,-5.05 3.1,-2.6Q1.9,-1.4 1.5,-0.2L1.05,1.4L1.05,1.6Q3.75,0.15 5.75,-1.5Q7.75,-3.1 9.05,-5.95L9.75,-8.1L10,-10.05L10.05,-11.35M7.8,-0.7Q6,1.5 3.1,3.95Q1.85,5.2 1.5,6.35L1.05,7.95Q3.75,6.5 5.75,4.85Q7.75,3.25 9.05,0.4L9.75,-1.75L10,-3.7L10.05,-4.75Q9.3,-2.65 7.8,-0.7";
  
    pathDot = "M8.259,-1.985C8.259,-1.248 8.867,-0.64 9.603,-0.64C10.339,-0.64 10.947,-1.248 10.947,-1.985C10.947,-2.721 10.339,-3.329 9.603,-3.329C8.867,-3.329 8.259,-2.721 8.259,-1.985Z";
  
    pathSharp = "M5.538,2.241L2.465,3.265L2.465,-2.273L5.538,-3.297L5.538,2.241ZM5.538,-11.011L5.538,-6.21L2.465,-5.186L2.465,-9.987L1.665,-9.987L1.665,-4.962L0,-4.417L0,-1.504L1.665,-2.049L1.665,3.489L0,4.033L0,6.946L1.665,6.402L1.665,10.979L2.465,10.979L2.465,6.178L5.538,5.154L5.538,9.955L6.338,9.955L6.338,4.93L8.003,4.385L8.003,1.472L6.338,2.017L6.338,-3.521L8.003,-4.065L8.003,-6.978L6.338,-6.434L6.338,-11.011L5.538,-11.011Z";
    pathFlat = "M0,5.858L4.513,2.529C6.498,1.088 7.266,-0.544 7.33,-1.761C7.33,-3.553 5.698,-4.898 3.777,-4.898C2.433,-4.898 1.44,-4.385 0.8,-3.329L1.024,-13.412L0,-13.412L0,5.858ZM2.977,-3.617C4.001,-3.617 4.77,-2.881 4.77,-1.889C4.77,-0.224 2.561,2.977 0.896,4.033C0.8,3.489 0.736,2.433 0.736,0.864C0.736,0 0.8,-1.056 0.928,-2.273C1.408,-3.169 2.081,-3.617 2.977,-3.617Z";
    pathNature = "M5.698,10.915L5.698,-6.274L0.8,-4.545L0.8,-10.979L0,-10.979L0,6.21L4.898,4.513L4.898,10.915L5.698,10.915ZM0.8,-1.953L4.898,-3.457L4.898,1.921L0.8,3.393L0.8,-1.953Z";
    pathAccent = "M3.9,-2.6Q3.9,-2.3 4.25,-1.7Q4.55,-1.15 5.35,-1.1Q6.7,-1.35 6.8,-2.65L7.1,-5L10.7,-5L10.7,-1.55L8.4,-1.1Q7.2,-0.95 7,0.35Q7.2,1.7 8.5,1.75L10.7,2.1L10.7,5.6L7.1,5.6L6.8,3.1Q6.6,1.8 5.35,1.7Q4.6,1.8 4.3,2.3L3.95,3.15L3.5,5.6L0,5.6L0,2.1L2.25,1.65Q3.6,1.5 3.7,0.2Q3.65,-0.55 3.1,-0.9L2.25,-1.25L0,-1.55L0,-5L3.5,-5L3.9,-2.6";
    pathDoubleFlat = "M7.95,-20L7.95,-4.3Q9.5,-5.65 11.5,-5.8Q12.75,-5.8 13.7,-4.8Q14.65,-3.85 14.7,-2.45Q14.55,-0.65 13.3,0.7Q12.05,2.05 10.7,3.05Q8.55,4.85 6.7,6.8L6.7,0.4L3.95,3.05L0,6.8L0,-20L1.25,-20L1.25,-4.3Q2.75,-5.65 4.75,-5.8Q5.85,-5.8 6.7,-5L6.7,-20L7.95,-20M3.4,-4.25Q2.7,-4.3 2,-3.65Q1.3,-2.95 1.25,-2.5L1.25,4.2L3.6,1.3Q4.85,-0.4 4.95,-2.1Q4.8,-4 3.4,-4.25M7.95,-2.5L7.95,4.2L10.35,1.3Q11.6,-0.4 11.7,-2.1Q11.6,-4 10.15,-4.25Q9.45,-4.3 8.75,-3.65L7.95,-2.5";
  
    pathTieLongUp = "M 0 0 Q 11.3745 -11.054 113.269 -11.054 Q 215.164 -11.054 226.538 0 Q 215.164 -11.804 113.269 -11.804 Q 11.3745 -11.804 0 0";
    pathTieLongDown = "M 0 0 Q 11.6801 11.9243 116.404 11.9243 Q 221.128 11.9243 232.808 0 Q 221.128 11.1743 116.404 11.1743 Q 11.6801 11.1743 0 0";
  
    pathTieShortUp = "M 0 0 Q 7.00566 -7.98301 62.3759 -7.98301 Q 117.746 -7.98301 124.752 0 Q 117.746 -8.73301 62.3759 -8.73301 Q 7.00566 -8.73301 0 0";
    pathTieShortDown = "M 0 0 Q 7.00566 8.73301 62.3759 8.73301 Q 117.746 8.73301 124.752 0 Q 117.746 7.98301 62.3759 7.98301 Q 7.00566 7.98301 0 0";
  

    trebleClef = ()=>{
        let l= new fabric.Path(this.pathTrebleClef, {
            fill: 'none',
            stroke: '#000000',
            strokeMiterLimit: 10,
            opacity: 1,
            left: 0, 
            top: 0, 
        });
    
        l.lockMovementY = true;
        return l;
      }
    
      baseClef = ()=>{
        let l= new fabric.Path(this.pathBaseClef, {
            fill: 'none',
            stroke: '#000000',
            strokeMiterLimit: 10,
            opacity: 1,
            left: 0, 
            top: -10, 
        });
    
        l.lockMovementY = true;
        return l;
      }
    
      endClef = ()=>{
        let l= new fabric.Path(this.pathEndClef, {
            fill: 'none',
            stroke: '#000000',
            strokeMiterLimit: 10,
            opacity: 1,
            left: 0, 
            top: 0, 
        });
    
        l.lockMovementY = true;
        return l;
      }
    
      getPaiPath(n){
        let path = this.path4;
        if(n==2)
            path = this.path2;
        else if(n==3)
            path = this.path3
        else 
            path = this.path4;
        return path;
      }
      pai = (n, up, offset)=>{
        let l= new fabric.Path(this.getPaiPath(n), {
            fill: 'none',
            stroke: '#000000',
            strokeMiterLimit: 10,
            opacity: 1,
            left: 35, 
            top: (up? 10: 30) +offset, 
        });
        l.lockMovementY = true;
        return l;
      }
    
    
    
      rests = new Map()
      .set("r64", this.path64Rest)
      .set("r32", this.path32Rest)
      .set("r16", this.path16Rest)
      .set("r8", this.path8Rest)
      .set("r4", this.pathQuarterRest)
      .set("r2", this.pathHalfRest)
      .set("r1", this.pathWholeRest)
    
      rest = (tag)=>{
        return this.restMark(this.rests.get(tag));
      }
    
      restMark = (tag)=>{
        let l= new fabric.Path(tag, {
            fill: 'none',
            stroke: 'transparent',
            strokeMiterLimit: 10,
            opacity: 1,
            left: 0, 
            top: 0, 
        });
    
        l.tag = "rest"
        l.lockMovementY = true;
        return l;
      }
    
    
      hollowHead = (left=0,top=44,color='black')=>{
        return new fabric.Path(this.pathHollowHead, {
            fill: color,
            stroke: color,
            strokeMiterLimit: 10,
            opacity: 1,
            left: left, 
            top: top,
            scaleX: 1.3,
            scaleY: 1.3
        });
      }
    
      solidHead = (left=0,top=43,color='black')=>{
        return new fabric.Path(this.pathSolidHead, {
            fill: color,
            stroke: color,
            strokeMiterLimit: 10,
            opacity: 1,
            left: left, 
            top: top,
            scaleX: 1.2,
            scaleY: 1.2
        })
      };
    
      stem = (tag, left, top, color)=>{
        let l = new fabric.Path(this.pathNoteStem, {
            fill: color,
            stroke: color,
            strokeMiterLimit: 10,
            opacity: 1,
            left: left, 
            top: top, 
        });
        l.tag = tag
        return l;
      }
    
      stemUp = (left=15, top=0)=>{
        return this.stem('stemup',left,top,'#000000');
      }
    
      stemDown = (left=0,top=50)=>{
        return this.stem('stemdown',left,top,'transparent');
      }
    
      tailsUp = new Map()
      .set(1, this.pathTailUp1)
      .set(2, this.pathTailUp2)
      .set(3, this.pathTailUp3)
      .set(4, this.pathTailUp4)
    
      tailsDown = new Map()
      .set(1, this.pathTailDown1)
      .set(2, this.pathTailDown2)
      .set(3, this.pathTailDown3)
      .set(4, this.pathTailDown4)
    
      tailUp = (n)=>{
        let l = new fabric.Path(this.tailsUp.get(n), {
            fill: 'none',
            stroke: 'transparent',
            strokeMiterLimit: 10,
            opacity: 1,
            left: 16, 
            top: 0, 
        });
        l.tag="tailup";
        return l;
      }
    
      tailDown = (n)=>{
        let offsetTop = 0, offsetLet = 0;
        if(n==3) {offsetTop = -6;offsetLet=0}
        if(n==4) {offsetTop = -12;offsetLet=0}
        let l = new fabric.Path(this.tailsDown.get(n), {
            fill: 'transparent',
            stroke: 'transparent',
            strokeMiterLimit: 10,
            opacity: 1,
            left: 0 + offsetLet, 
            top: 69 + offsetTop, 
        });
        l.tag="taildown"
        return l;
      }
    
      pathUnderline = "M0,0L24,0 M0,1L24,1";
      underLine = (groupId, n, pai)=>{
        return this.mark("underline", this.pathUnderline, groupId, n, pai, 
        -17, -12, 13, true);
      }
      uperLine = (groupId, n, pai)=>{
        return this.markUp("underline", this.pathUnderline, groupId, n, pai, 
        -17, -12, -15);
      }

  dot = (groupId, n, pai, color='black', left=8, top=8)=>{
    return this.mark("dot", this.pathDot, groupId, n, pai, 
    left, left+4, top, true, color);
  }
  
  tie = (distance, groupId, n, pai, isUnderTurnAroundNoteKey)=>{
    return this.mark("tie", this.getTiePath(distance,isUnderTurnAroundNoteKey), groupId, n, pai, 
    6, 10, 30, true);
  }

  getTiePath(distance, isUnderTurnAroundNoteKey){
    let path = isUnderTurnAroundNoteKey?this.pathTieLongDown:this.pathTieLongUp;
    if(distance<160){
        path =  isUnderTurnAroundNoteKey?this.pathTieShortDown:this.pathTieShortUp;
    }
    return path;
  }

  fingers = new Map()
  .set("1", this.path1)
  .set("2", this.path2)
  .set("3", this.path3)
  .set("4", this.path4)
  .set("5", this.path5)
  .set("9", this.pathFermata)

  finger = (tag, groupId, n, pai, scaleX, scaleY)=>{
    n-=2;
    return this.mark(tag, this.fingers.get(tag), groupId, n, pai, 
    -8, -3, 5, false, scaleX, scaleY);
  }

  keySignature = new Map()
  .set("G", [{name: "f", accidental: 'sharp'}])
  .set("F", [{name: "b", accidental: 'flat'}])

  accidentals = new Map()
  .set("sharp", this.pathSharp)
  .set("2sharp", this.pathAccent)
  .set("flat", this.pathFlat)
  .set("2flat", this.pathDoubleFlat)
  .set("natural", this.pathNature)

  accidental = (tag, groupId, n, pai, color='black', left1=-28, left2=-22, top=5)=>{
    return this.mark(tag, this.accidentals.get(tag), groupId, n, pai, 
    left1, left2, top, true, color);
  }

  mark = (tag, path, groupId, n, pai, leftWidthTail, leftNoTail, top, 
    lockY=true, color = "black", scaleX=1, scaleY=1)=>{
    let left = (pai<=1/8)?leftWidthTail:leftNoTail;
    let l = new fabric.Path(path, {
        fill: 'none',
        stroke: '#000000',
        strokeMiterLimit: 10,
        opacity: 1,
        left: left, 
        top: top-n*14,
    });
    l.tag = tag;
    
    l.gid = groupId;
    l.lockMovementY = true;
    return l;
  }

  markUp = (tag, path, groupId, n, pai, left1, left2, top)=>{
    let left = pai<=1/8?left1:left2;
    let l = new fabric.Path(path, {
        fill: 'none',
        stroke: '#000000',
        strokeMiterLimit: 10,
        opacity: 1,
        left: left, 
        top: top+n*14,
    });
    l.tag = tag;
    
    l.gid = groupId;
    l.lockMovementY = true;
    return l;
  }


  f = new Map()
    .set('r',0)
    .set('a0',27.500)
    .set('a#0',29.135)
    .set('b0',30.868)
    .set('c1',32.703)
    .set('c#1',34.648)
    .set('d1',36.708)
    .set('d#1',38.891)
    .set('e1',41.203)
    .set('f1',43.654)
    .set('f#1',46.249)
    .set('g1',48.999) 
    .set('g#1',51.913)
    .set('a1',55.000)
    .set('a#1',58.270)
    .set('b1',61.735)
    .set('c2',65.406)
    .set('c#2',69.296)
    .set('d2',73.416)
    .set('d#2',77.782)
    .set('e2',82.407)
    .set('f2',87.307)
    .set('f#2',92.499)
    .set('g2',97.999)  
    .set('g#2',103.826)
    .set('a2',110.000)
    .set('a#2',116.541)
    .set('b2',123.471)
    .set('c3',130.813)
    .set('c#3',138.591)
    .set('d3',146.832)
    .set('d#3',155.563)
    .set('e3',164.814)
    .set('f3',174.614)
    .set('f#3',184.997)
    .set('g3',195.998) 
    .set('g#3',207.652)
    .set('a3',220.000)
    .set('a#3',233.082)
    .set('b3',246.942)
    .set('c4',261.626)//central c
    .set('c#4',277.183)
    .set('d4',293.665)
    .set('d#4',311.127)
    .set('e4',329.628)
    .set('f4',349.228)
    .set('f#4',369.994)
    .set('g4',391.995)
    .set('g#4',415.305)
    .set('a4',440.000)
    .set('a#4',466.164)
    .set('b4',493.883)
    .set('c5',523.251)
    .set('c#5',554.365)
    .set('d5',587.330)
    .set('d#5',622.254)
    .set('e5',659.255)
    .set('f5',698.456)
    .set('f#5',739.989)
    .set('g5',783.991)
    .set('g#5',830.609)
    .set('a5',880.000)
    .set('a#5',932.328)
    .set('b5',987.767)
    .set('c6',1046.502)
    .set('c#6',1108.731)
    .set('d6',1174.659)
    .set('d#6',1244.508)
    .set('e6',1318.510)  
    .set('f6',1396.913)
    .set('f#6',1479.978)
    .set('g6',1567.982)
    .set('g#6',1661.219)
    .set('a6',1760.000)
    .set('a#6',1864.655)
    .set('b6',1975.533)
    .set('c7',2093.005)
    .set('c#7',2217.461)
    .set('d7',2349.318)
    .set('d#7',2489.016)
    .set('e7',2637.020)
    .set('f7',2793.826)
    .set('f#7',2959.955)
    .set('g7',3135.963)  
    .set('g#7',3322.438)
    .set('a7',3520.000)
    .set('a#7',3729.310)
    .set('b7',3951.066)
    .set('c8',4186.009)


    save(music){
        this.localStorageService.store("1", music);
    }

    load(key){
        return this.localStorageService.retrieve(key);
    }

    tempStore(value){
        this.localStorageService.store("tempStore", value);
    }

    tempGet(){
        return this.localStorageService.retrieve("tempStore");
    }

    saveSpeed(songId, speed){
        this.localStorageService.store(songId, speed);
    }

    getSpeed(songId){
        return this.localStorageService.retrieve(songId);
    }


}
