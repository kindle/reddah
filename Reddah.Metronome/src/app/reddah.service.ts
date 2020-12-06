import { Inject, Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { AlertController, LoadingController, NavController, ModalController, ToastController, Platform } from '@ionic/angular';

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

}
