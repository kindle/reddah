import { Inject, Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { AlertController, LoadingController, NavController, ModalController, ToastController, Platform } from '@ionic/angular';

import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, LocalNotifications,
    CameraPhoto, CameraSource, HapticsImpactStyle } from '@capacitor/core';
    
import { Locale } from './model/locale';
import { DOCUMENT } from '@angular/common';
    
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


    test1(){
        for(let i=1;i<=31;i++){
            let r = Math.floor((Math.random()*3)+1);

            this.localStorageService.store(`TaskTime_${i}`, 200);
            this.localStorageService.store(`TaskMyStars_${i}`, r);
        }
        this.localStorageService.store(`Reddah_MyCoins`, 200);
    }

    test2(){
        for(let i=1;i<=33;i++){
            let r = Math.floor((Math.random()*3)+1);

            this.localStorageService.store(`TaskTime_${i}`, 200);
            this.localStorageService.store(`TaskMyStars_${i}`, r);
        }
        this.localStorageService.store(`Reddah_MyCoins`, 200);
    }

    test3(){
        for(let i=34;i<=79;i++){
            let r = Math.floor((Math.random()*3)+1);

            this.localStorageService.store(`TaskTime_${i}`, 200);
            this.localStorageService.store(`TaskMyStars_${i}`, r);
        }
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

    pass(task, seconds){
        if(seconds>1&&seconds<99999){
            let oldTime = this.getMyTime(task.id);
            if(oldTime!=null&&seconds<oldTime)
            {
                this.localStorageService.store(`TaskTime_${task.id}`, seconds);
                let mystar = 0;
                
                if(seconds<=task["seconds3star"]){
                    mystar = 3;
                    this.addMyCoints(5);
                }else if(seconds<=task["seconds2star"]){
                    mystar = 2;
                    this.addMyCoints(3);
                }else if(seconds<=task["seconds1star"]){
                    mystar = 1;
                    this.addMyCoints(2);
                }else{
                    mystar = 0;
                    this.addMyCoints(1);
                }
                this.localStorageService.store(`TaskMyStars_${task.id}`, mystar);
            }
        }
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

    getMyCoins(){
        let count = this.localStorageService.retrieve(`Reddah_MyCoins`);
        if(count!=null)
            return count;
        return 0;
    }

    addMyCoints(n){
        let current = this.getMyCoins();
        this.localStorageService.store(`Reddah_MyCoins`, current+n);
        this.toast('+', n);
    }

    subMyCoints(n){
        let current = this.getMyCoins();
        this.localStorageService.store(`Reddah_MyCoins`, current-n);
        this.toast('-', n);
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

    getBuyCount(){
        let count = this.localStorageService.retrieve(`Reddah_BuyTimes`);
        if(count==null)
            count=0;
        return count;
    }

    addBuyCount(){
        let count = this.localStorageService.retrieve(`Reddah_BuyTimes`);
        if(count==null)
            count=0;
        this.localStorageService.store(`Reddah_BuyTimes`, count+1);
    }

    buyPrice(){
        return 10 + this.getBuyCount()*10;
    }

    buyTask(task){
        this.localStorageService.store(`TaskTime_${task.id-1}`, 99998);
        this.localStorageService.store(`TaskMyStars_${task.id-1}`, 0);
        let price = 10 + this.getBuyCount()*10;
        this.subMyCoints(price);
        this.addBuyCount();
    }

    getMyTime(taskId){
        let myTime = this.localStorageService.retrieve(`TaskTime_${taskId}`);
        if(myTime!=null&&myTime>0)
            return myTime;
        return 99999;
    }

    getMyStars(taskId){
        let myStars = this.localStorageService.retrieve(`TaskMystars_${taskId}`);
        if(myStars!=null&&myStars>0&&myStars<=3)
            return myStars;
        return 0;
        /*if(myStars!=null)
            return -1;
        return myStars;*/
    }

    getAllMyStars(){
        let count = 0;
        for(let i=1;i<=256;i++){
            let myStars = this.localStorageService.retrieve(`TaskMystars_${i}`);
            if(myStars==null)
            {}
            else
                count+= myStars;
        }

        return count;
    }

    getMaxLevelUnlocked(){
        let allMyStars = this.getAllMyStars();

        if(allMyStars>=300){
            return 4;
        }else if(allMyStars>=145){
            return 3;
        }else if(allMyStars>=35){
            return 2;
        }

        return 1
    }


    getLevelTasks(n){
        let tasks = [];
        if(n==1){
            //16*3
            for(let i=1;i<=16;i++){
                tasks.push({
                    id: i,
                    level: 1,
                    name: 'Sudoku',
                    maxim: 'maxim',
                    solution: this.solution[i],
                    display: this.musk.get(i),
                    seconds1star: 300,
                    seconds2star: 150,
                    seconds3star: 90,
                });
            }

            for(let i=17;i<=48;i++){
                tasks.push({
                    id: i,
                    level: 1,
                    name: 'Sudoku',
                    maxim: 'Constant dropping wears the stone',
                    solution: this.solution[i],
                    display: this.musk.get(i),
                    seconds1star: 600,
                    seconds2star: 300,
                    seconds3star: 180,
                });
            }
        }
        else if(n==2){
            //16*3
            for(let i=49;i<=96;i++){
                tasks.push({
                    id: i,
                    level: 2,
                    name: 'Sudoku',
                    maxim: 'Constant dropping wears the stone',
                    solution: this.solution[i],
                    display: this.musk.get(i),
                    seconds1star: 900,
                    seconds2star: 600,
                    seconds3star: 360
                });
            }
        }else if(n==3){
            //16*3
            for(let i=97;i<=144;i++){
                tasks.push({
                    id: i,
                    level: 3,
                    name: 'Sudoku',
                    maxim: 'Constant dropping wears the stone',
                    solution: this.solution[i],
                    display: this.musk.get(i),
                    seconds1star: 1200,
                    seconds2star: 900,
                    seconds3star: 540,
                });
            }
        }else if(n==4){
            //16*2
            for(let i=145;i<=176;i++){
                tasks.push({
                    id: i,
                    level: 4,
                    name: 'Sudoku',
                    maxim: 'Constant dropping wears the stone',
                    solution: this.solution[i],
                    display: this.musk.get(i),
                    seconds1star: 1500,
                    seconds2star: 1200,
                    seconds3star: 600,
                });
            }
        }
        else{

        }
        

        return tasks;
    }

    getDisplay(solution, musk){
        for(let i=0;i<81;i++){
            if(musk[i]==0)
                solution[i]=0;
        }
        return solution;
    }

    musk = new Map()
    .set(1, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 0, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(2, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 0, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 0, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(3, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  0, 0, 0,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(4, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  0, 0, 1,  1, 1, 1, 
        1, 1, 1,  0, 0, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(5, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 0, 1,  1, 1, 1, 
        1, 1, 1,  0, 0, 0,  1, 1, 1, 
        1, 1, 1,  1, 0, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(6, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 0, 0,  1, 1, 1,  1, 1, 1, 
        1, 0, 0,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  0, 0, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(7, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 0, 1,  1, 0, 1,  1, 1, 1, 
        1, 0, 1,  1, 0, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 0, 0,  0, 0, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 0, 1,  1, 0, 1,  1, 1, 1, 
        1, 0, 1,  1, 0, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(8, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  0, 0, 0,  1, 1, 1, 
        1, 1, 1,  0, 0, 0,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(9, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 0, 0,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 0, 1,  1, 1, 1, 
        1, 1, 1,  0, 0, 0,  1, 1, 1, 
        1, 1, 1,  1, 0, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  0, 0, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(10, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 0, 0,  1, 1, 1,  0, 0, 1, 
        1, 0, 1,  1, 1, 1,  1, 0, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 0, 1,  1, 1, 1,  1, 0, 1, 
        1, 0, 0,  1, 1, 1,  0, 0, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(11, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 0,  0, 0, 0,  0, 1, 1, 

        1, 1, 0,  1, 1, 1,  0, 1, 1, 
        1, 1, 0,  1, 1, 1,  0, 1, 1, 
        1, 1, 0,  1, 1, 1,  0, 1, 1,

        1, 1, 0,  0, 0, 0,  0, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(12, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 0, 1,  1, 1, 1, 
        1, 1, 1,  0, 1, 0,  1, 1, 1, 

        1, 1, 0,  1, 1, 1,  0, 1, 1, 
        1, 0, 1,  1, 1, 1,  1, 0, 1, 
        1, 1, 0,  1, 1, 1,  0, 1, 1,

        1, 1, 1,  0, 1, 0,  1, 1, 1, 
        1, 1, 1,  1, 0, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(13, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 0, 0,  1, 1, 1, 
        1, 1, 1,  1, 0, 0,  1, 1, 1, 

        1, 1, 1,  0, 0, 1,  1, 1, 1, 
        1, 1, 1,  0, 0, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 0, 0,  1, 1, 1, 
        1, 1, 1,  1, 0, 0,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(14, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 0, 0,  1, 1, 1,  0, 0, 1, 
        1, 0, 0,  1, 1, 1,  0, 0, 1, 

        1, 1, 0,  0, 0, 0,  0, 1, 1, 
        1, 1, 0,  0, 1, 0,  0, 1, 1, 
        1, 1, 1,  0, 1, 0,  1, 1, 1,

        1, 1, 1,  0, 1, 0,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(15, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 0, 1,  1, 0, 1,  1, 0, 1, 
        1, 1, 0,  1, 0, 1,  0, 1, 1, 

        1, 0, 1,  1, 0, 1,  1, 0, 1, 
        1, 0, 0,  1, 0, 1,  0, 0, 1, 
        1, 1, 0,  1, 1, 1,  0, 1, 1,

        1, 0, 1,  1, 0, 1,  1, 0, 1, 
        1, 1, 0,  1, 0, 1,  0, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(16, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 0, 1,  1, 1, 1, 
        1, 1, 1,  1, 0, 1,  1, 1, 1, 

        1, 1, 1,  0, 0, 0,  1, 1, 1, 
        1, 0, 0,  0, 0, 0,  0, 0, 1, 
        1, 1, 1,  0, 0, 0,  1, 1, 1,

        1, 1, 1,  1, 0, 1,  1, 1, 1, 
        1, 1, 1,  1, 0, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(17, [
        1, 0, 1,  0, 1, 1,  1, 0, 1,
        0, 1, 0,  1, 1, 0,  1, 1, 1, 
        1, 0, 1,  1, 0, 0,  0, 1, 0, 

        0, 1, 1,  1, 1, 1,  1, 0, 1, 
        1, 1, 0,  1, 0, 1,  0, 0, 1, 
        1, 0, 0,  1, 1, 1,  0, 1, 1,

        1, 1, 0,  1, 0, 0,  1, 1, 1, 
        1, 1, 1,  0, 1, 1,  1, 1, 0, 
        0, 1, 0,  1, 1, 1,  1, 0, 1
    ])
    .set(18, [
        1, 1, 0,  1, 1, 0,  0, 1, 1,
        1, 0, 1,  0, 0, 1,  0, 1, 1, 
        0, 1, 1,  1, 1, 1,  0, 1, 1, 

        1, 0, 1,  0, 1, 1,  0, 1, 1, 
        1, 0, 1,  1, 1, 0,  0, 1, 1, 
        0, 1, 1,  1, 1, 0,  1, 0, 1,

        0, 0, 0,  0, 0, 1,  1, 1, 1, 
        1, 1, 1,  1, 0, 1,  1, 1, 0, 
        1, 1, 1,  1, 0, 1,  1, 0, 1
    ])
    .set(19, [
        0, 0, 1,  1, 1, 1,  1, 0, 1,
        0, 1, 1,  1, 0, 0,  1, 0, 1, 
        1, 1, 1,  1, 1, 0,  0, 1, 1, 

        1, 1, 0,  1, 1, 1,  1, 0, 0, 
        1, 0, 1,  1, 0, 0,  1, 1, 1, 
        1, 0, 0,  1, 0, 1,  0, 1, 1,

        1, 1, 0,  1, 1, 0,  1, 1, 1, 
        1, 0, 1,  1, 0, 1,  1, 0, 0, 
        0, 1, 1,  0, 1, 1,  1, 0, 1
    ])
    .set(20, [
        1, 0, 0,  0, 0, 0,  0, 1, 0,
        0, 1, 0,  0, 0, 0,  1, 0, 0, 
        0, 0, 1,  1, 1, 1,  1, 0, 0, 

        0, 0, 1,  1, 0, 0,  0, 1, 0, 
        0, 1, 0,  0, 1, 0,  0, 1, 0, 
        0, 1, 0,  0, 0, 1,  1, 0, 0,

        0, 0, 1,  1, 1, 1,  1, 0, 0, 
        0, 0, 1,  0, 0, 0,  0, 1, 0, 
        0, 1, 0,  0, 0, 0,  0, 0, 1
    ])
    .set(21, [
        1, 0, 0,  1, 1, 0,  0, 0, 0,
        0, 0, 1,  0, 0, 1,  0, 1, 0, 
        0, 1, 0,  0, 1, 0,  1, 0, 0, 

        1, 0, 0,  1, 0, 0,  0, 1, 0, 
        1, 0, 1,  0, 0, 0,  1, 0, 1, 
        0, 1, 0,  0, 0, 1,  0, 0, 1,

        0, 0, 1,  0, 1, 0,  0, 1, 0, 
        0, 1, 0,  1, 0, 0,  1, 0, 0, 
        0, 0, 0,  0, 1, 1,  0, 0, 1
    ])
    .set(22, [
        0, 0, 1,  0, 1, 1,  0, 1, 0,  
        0, 1, 0,  1, 0, 1,  1, 1, 1,  
        1, 0, 1,  1, 0, 1,  1, 0, 1,  
        
        0, 1, 1,  0, 1, 1,  0, 1, 1,  
        1, 0, 0,  1, 1, 1,  1, 0, 1,  
        1, 1, 1,  1, 1, 0,  0, 1, 0,  
        
        0, 1, 1,  0, 1, 0,  1, 0, 1,  
        1, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 1, 1,  1, 1, 0,  1, 0, 0 
        ])
    .set(23, [
        1, 0, 1,  1, 0, 0,  1, 1, 1,  
        0, 1, 1,  1, 1, 1,  0, 0, 1,  
        1, 1, 1,  1, 0, 0,  1, 0, 1,  
        
        1, 1, 1,  1, 0, 1,  0, 1, 0,  
        0, 1, 0,  0, 0, 1,  1, 0, 1,  
        0, 1, 0,  1, 1, 1,  0, 0, 1,  
        
        1, 0, 1,  0, 1, 0,  1, 1, 1,  
        1, 0, 0,  1, 0, 0,  1, 0, 1,  
        1, 1, 1,  0, 1, 1,  1, 1, 0 
        ])
    .set(24, [
        1, 0, 0,  0, 1, 0,  1, 1, 1,  
        0, 0, 1,  0, 1, 0,  1, 1, 1,  
        0, 1, 0,  1, 1, 1,  1, 1, 0,  
        
        0, 0, 1,  1, 1, 1,  0, 1, 0,  
        1, 1, 1,  1, 0, 1,  1, 0, 1,  
        0, 0, 1,  1, 1, 1,  0, 0, 1,  
        
        1, 1, 1,  0, 1, 1,  1, 1, 0,  
        1, 1, 1,  1, 0, 0,  1, 1, 0,  
        1, 1, 0,  0, 1, 1,  0, 0, 1 
        ])
    .set(25, [
        1, 0, 1,  1, 0, 0,  1, 0, 1,  
        0, 1, 1,  0, 1, 0,  0, 1, 0,  
        1, 1, 1,  1, 1, 1,  1, 0, 1,  
        
        1, 0, 1,  1, 0, 1,  0, 0, 0,  
        0, 1, 1,  0, 1, 1,  0, 1, 1,  
        0, 0, 1,  1, 1, 1,  1, 1, 1,  
        
        1, 0, 1,  0, 0, 1,  0, 1, 1,  
        0, 1, 0,  0, 1, 1,  1, 0, 1,  
        1, 0, 1,  0, 1, 1,  1, 1, 0 
        ])
    .set(26, [
        1, 1, 0,  1, 1, 0,  0, 0, 1,  
        1, 0, 1,  1, 1, 0,  1, 1, 1,  
        0, 1, 0,  1, 0, 1,  1, 0, 1,  
        
        1, 1, 1,  0, 1, 1,  0, 0, 0,  
        1, 1, 0,  1, 0, 1,  1, 1, 0,  
        0, 0, 1,  1, 1, 0,  1, 1, 1,  
        
        0, 1, 1,  0, 1, 0,  0, 1, 0,  
        0, 1, 0,  0, 1, 1,  1, 1, 1,  
        1, 1, 1,  0, 0, 1,  0, 1, 1 
        ])
    .set(27, [
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0 
        ])
    .set(28, [
        0, 0, 0,  0, 1, 1,  1, 1, 0,  
        0, 0, 0,  1, 0, 0,  0, 1, 1,  
        0, 0, 1,  1, 0, 0,  1, 0, 1,  
        
        0, 1, 1,  0, 0, 1,  0, 0, 1,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        1, 0, 0,  1, 0, 0,  1, 1, 0,  
        
        1, 0, 1,  0, 0, 1,  1, 0, 0,  
        1, 1, 0,  0, 0, 1,  0, 0, 0,  
        0, 1, 1,  1, 1, 0,  0, 0, 0 
        ])
    .set(29, [
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0 
        ])
    .set(30, [
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0 
        ])
    .set(31, [
        0, 1, 0,  0, 0, 0,  1, 1, 0,  
        1, 1, 1,  0, 0, 0,  1, 1, 1,  
        0, 1, 1,  1, 0, 1,  1, 1, 0,  
        
        0, 0, 1,  1, 1, 1,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        0, 0, 1,  1, 1, 1,  1, 0, 1,  
        
        0, 1, 1,  1, 0, 1,  1, 1, 0,  
        1, 1, 1,  0, 0, 0,  1, 1, 1,  
        0, 1, 0,  0, 0, 0,  0, 1, 0 
        ])
    .set(32, [
        0, 0, 0,  1, 0, 0,  0, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        
        0, 0, 1,  0, 1, 0,  1, 0, 1,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 1,  0, 1, 0,  1, 0, 0,  
        
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  0, 0, 1,  0, 0, 0 
        ])
    .set(33, [
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0 
        ])
    .set(34, [
        0, 0, 0,  0, 0, 0,  0, 1, 1,  
        0, 0, 0,  0, 0, 1,  1, 1, 1,  
        0, 0, 1,  1, 1, 1,  0, 1, 0,  
        
        0, 0, 1,  0, 0, 1,  1, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 1,  1, 0, 0,  1, 0, 0,  
        
        0, 1, 0,  1, 1, 1,  1, 0, 0,  
        1, 1, 1,  1, 0, 0,  0, 0, 0,  
        1, 1, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(35, [
        0, 0, 0,  0, 1, 1,  1, 0, 0,  
        0, 0, 1,  0, 0, 0,  0, 1, 0,  
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        
        0, 1, 1,  1, 0, 0,  0, 0, 1,  
        0, 0, 0,  0, 0, 0,  1, 0, 1,  
        1, 0, 0,  0, 0, 1,  0, 0, 0,  
        
        0, 1, 0,  0, 0, 1,  0, 1, 0,  
        1, 0, 1,  0, 0, 1,  1, 0, 0,  
        0, 1, 0,  1, 0, 0,  0, 0, 0 
        ])
    .set(36, [
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 0, 0,  1, 1, 1,  0, 0, 0,  
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        0, 0, 0,  1, 1, 1,  0, 0, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(37, [
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        
        1, 0, 1,  0, 1, 0,  1, 0, 1,  
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        1, 0, 1,  0, 1, 0,  1, 0, 1,  
        
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0 
        ])
    .set(38, [
        0, 0, 1,  0, 0, 1,  0, 0, 0,  
        0, 0, 1,  0, 0, 1,  0, 0, 0,  
        0, 0, 1,  0, 1, 0,  1, 1, 1,  
        
        1, 1, 0,  1, 0, 0,  0, 0, 0,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 0, 0,  0, 0, 1,  0, 1, 1,  
        
        1, 1, 1,  0, 1, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 0,  1, 0, 0 
        ])
    .set(39, [
        0, 0, 0,  1, 1, 1,  0, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 1, 1,  0, 0, 0 
        ])
    .set(40, [
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        
        0, 0, 1,  0, 1, 0,  1, 0, 1,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 1,  0, 1, 0,  1, 0, 0,  
        
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        0, 1, 0,  0, 0, 1,  0, 1, 0 
        ])
    .set(41, [
        1, 0, 0,  1, 1, 0,  1, 0, 0,  
        1, 0, 0,  1, 1, 0,  1, 0, 0,  
        1, 0, 0,  0, 0, 0,  1, 1, 0,  
        
        0, 1, 0,  1, 0, 1,  0, 0, 0,  
        1, 1, 0,  0, 0, 0,  0, 1, 1,  
        0, 0, 0,  1, 0, 1,  0, 1, 0,  
        
        0, 1, 1,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  0, 1, 1,  0, 0, 1,  
        0, 0, 1,  0, 1, 1,  0, 0, 1 
        ])
    .set(42, [
        1, 1, 0,  0, 1, 0,  0, 1, 1,  
        1, 1, 0,  1, 0, 1,  0, 1, 1,  
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        1, 1, 0,  1, 0, 1,  0, 1, 1,  
        1, 1, 0,  0, 1, 0,  0, 1, 1 
        ])
    .set(43, [
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        1, 1, 0,  0, 0, 0,  0, 1, 1,  
        
        0, 1, 0,  1, 1, 1,  0, 1, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 1, 0,  1, 1, 1,  0, 1, 0,  
        
        1, 1, 0,  0, 0, 0,  0, 1, 1,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  1, 0, 1,  1, 0, 0 
        ])
    .set(44, [
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        1, 1, 0,  1, 0, 0,  1, 0, 0,  
        
        1, 1, 0,  1, 1, 0,  0, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 0,  0, 1, 1,  0, 1, 1,  
        
        0, 0, 1,  0, 0, 1,  0, 1, 1,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 0, 0,  0, 1, 0 
        ])
    .set(45, [
        0, 1, 1,  1, 0, 0,  0, 0, 0,  
        0, 1, 0,  0, 0, 1,  0, 1, 1,  
        0, 0, 1,  0, 0, 0,  1, 0, 1,  
        
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 0,  1, 1, 1,  0, 0, 0,  
        1, 0, 0,  0, 1, 0,  0, 1, 0,  
        
        1, 0, 1,  0, 0, 0,  1, 0, 0,  
        1, 1, 0,  1, 0, 0,  0, 1, 0,  
        0, 0, 0,  0, 0, 1,  1, 1, 0 
        ])
    .set(46, [
        1, 0, 1,  0, 0, 0,  0, 1, 1,  
        1, 0, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 0,  1, 0, 1,  0, 1, 0,  
        
        0, 1, 1,  0, 1, 0,  1, 0, 0,  
        0, 0, 0,  1, 1, 1,  0, 0, 0,  
        0, 0, 1,  0, 1, 0,  1, 1, 0,  
        
        0, 1, 0,  1, 0, 1,  0, 0, 1,  
        0, 0, 0,  1, 0, 1,  0, 0, 1,  
        1, 1, 0,  0, 0, 0,  1, 0, 1 
        ])
    .set(47, [
        0, 1, 1,  1, 0, 0,  0, 1, 0,  
        1, 0, 1,  1, 0, 0,  0, 0, 1,  
        0, 0, 0,  1, 1, 0,  0, 1, 1,  
        
        0, 0, 0,  0, 1, 0,  1, 1, 1,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        1, 1, 1,  0, 1, 0,  0, 0, 0,  
        
        1, 1, 0,  0, 1, 1,  0, 0, 0,  
        1, 0, 0,  0, 0, 1,  1, 0, 1,  
        0, 1, 0,  0, 0, 1,  1, 1, 0 
        ])
    .set(48, [
        0, 0, 1,  0, 1, 1,  0, 1, 0,  
        1, 0, 1,  0, 0, 1,  0, 0, 0,  
        0, 0, 0,  0, 0, 1,  0, 1, 1,  
        
        1, 1, 1,  0, 0, 0,  0, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 0,  0, 0, 0,  1, 1, 1,  
        
        1, 1, 0,  1, 0, 0,  0, 0, 0,  
        0, 0, 0,  1, 0, 0,  1, 0, 1,  
        0, 1, 0,  1, 1, 0,  1, 0, 0 
        ])
    //中级
    .set(49, [
        0, 0, 0,  1, 0, 0,  0, 0, 1,  
        0, 0, 1,  0, 1, 0,  0, 1, 0,  
        0, 1, 0,  0, 0, 1,  1, 0, 0,  
        
        1, 0, 0,  0, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 0,  0, 0, 1,  
        
        0, 0, 1,  1, 0, 0,  0, 1, 0,  
        0, 1, 0,  0, 1, 0,  1, 0, 0,  
        1, 0, 0,  0, 0, 1,  0, 0, 0 
        ])
    .set(50, [
        0, 0, 0,  0, 0, 0,  1, 0, 0,  
        0, 1, 1,  1, 0, 1,  0, 1, 0,  
        1, 0, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  1, 0, 1,  1, 1, 0,  
        0, 0, 1,  0, 0, 0,  0, 0, 0 
        ])
    .set(51, [
        0, 0, 1,  1, 1, 0,  0, 0, 0,  
        0, 1, 0,  0, 0, 1,  0, 0, 0,  
        1, 0, 0,  0, 0, 1,  1, 0, 0,  
        
        1, 0, 0,  0, 1, 0,  1, 1, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 1, 1,  0, 1, 0,  0, 0, 1,  
        
        0, 0, 1,  1, 0, 0,  0, 0, 1,  
        0, 0, 0,  1, 0, 0,  0, 1, 0,  
        0, 0, 0,  0, 1, 1,  1, 0, 0 
        ])
    .set(52, [
        0, 0, 0,  0, 1, 1,  0, 0, 0,  
        0, 0, 0,  1, 0, 1,  1, 0, 0,  
        0, 0, 0,  0, 0, 0,  1, 1, 0,  
        
        0, 1, 0,  0, 0, 0,  0, 1, 1,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        1, 1, 0,  0, 0, 0,  0, 1, 0,  
        
        0, 1, 1,  0, 0, 0,  0, 0, 0,  
        0, 0, 1,  1, 0, 1,  0, 0, 0,  
        0, 0, 0,  1, 1, 0,  0, 0, 0 
        ])
    .set(53, [
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  0, 1, 0,  0, 0, 0,  
        
        1, 0, 0,  0, 0, 1,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        1, 0, 0,  1, 0, 0,  0, 0, 1,  
        
        0, 0, 0,  0, 1, 0,  1, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 1, 0,  1, 0, 1,  0, 1, 0 
        ])
    .set(54, [
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        
        0, 1, 0,  1, 0, 0,  0, 1, 0,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 1, 0,  0, 0, 1,  0, 1, 0,  
        
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 1,  0, 0, 0,  0, 0, 1 
        ])
    .set(55, [
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0 
        ])
    .set(56, [
        1, 1, 0,  0, 1, 1,  0, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 0,  0, 0, 1,  1, 0, 0,  
        
        1, 0, 0,  1, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 1,  0, 0, 1,  
        
        0, 0, 1,  1, 0, 0,  0, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 0,  1, 1, 0,  0, 1, 1 
        ])
    .set(57, [
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        1, 0, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1 
        ])
    .set(58, [
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 0, 0,  1, 0, 0,  0, 0, 1,  
        
        0, 0, 0,  1, 0, 0,  0, 0, 1,  
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        1, 0, 0,  0, 0, 1,  0, 0, 0,  
        
        1, 0, 0,  0, 0, 1,  0, 0, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 1, 1,  0, 0, 0,  1, 1, 0 
        ])
    .set(59, [
        0, 0, 1,  0, 1, 1,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0 
        ])
    .set(60, [
        1, 1, 1,  0, 0, 0,  1, 0, 0,  
        1, 0, 0,  0, 0, 0,  1, 0, 0,  
        1, 0, 0,  0, 0, 0,  1, 1, 1,  
        
        0, 0, 0,  0, 1, 1,  0, 0, 0,  
        0, 0, 0,  1, 1, 1,  0, 0, 0,  
        0, 0, 0,  1, 1, 0,  0, 0, 0,  
        
        1, 1, 1,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  1, 1, 1 
        ])
    .set(61, [
        1, 0, 0,  1, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 1,  0, 0, 1,  
        
        1, 0, 0,  1, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 1,  0, 0, 1,  
        
        1, 0, 0,  1, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 1,  0, 0, 1 
        ])
    .set(62, [
        0, 0, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 0,  1, 0, 1,  1, 0, 1,  
        0, 0, 1,  0, 1, 0,  0, 1, 0,  
        
        0, 1, 0,  1, 0, 0,  0, 1, 0,  
        1, 0, 1,  0, 0, 1,  1, 0, 1,  
        0, 1, 0,  0, 0, 1,  0, 1, 0,  
        
        0, 1, 0,  0, 1, 0,  1, 0, 0,  
        1, 0, 1,  1, 0, 1,  0, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 0, 0 
        ])
    .set(63, [
        0, 1, 0,  0, 1, 1,  1, 1, 0,  
        0, 1, 0,  1, 0, 0,  0, 0, 1,  
        0, 1, 0,  1, 0, 0,  0, 0, 1,  
        
        0, 0, 0,  1, 0, 0,  0, 1, 1,  
        1, 0, 0,  1, 0, 1,  0, 1, 1,  
        1, 1, 0,  0, 0, 1,  0, 0, 0,  
        
        1, 0, 0,  0, 0, 1,  0, 1, 0,  
        1, 0, 0,  0, 0, 1,  0, 1, 0,  
        0, 1, 1,  1, 1, 0,  0, 1, 0 
        ])
    .set(64, [
        1, 0, 0,  1, 1, 1,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        0, 0, 0,  1, 1, 1,  0, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1 
        ])
    .set(65, [
        0, 0, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(66, [
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 1, 1,  0, 0, 0,  1, 1, 1,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1 
        ])
    .set(67, [
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(68, [
        1, 0, 0,  0, 0, 1,  0, 1, 0,  
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 1,  1, 0, 0,  0, 0, 0,  
        
        0, 0, 1,  1, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 1,  1, 0, 0,  
        
        0, 0, 0,  0, 0, 1,  1, 0, 0,  
        1, 0, 0,  0, 1, 0,  0, 1, 0,  
        0, 1, 0,  1, 0, 0,  0, 0, 1 
        ])
    .set(69, [
        0, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 0, 0,  1, 1, 0,  
        0, 0, 1,  1, 1, 0,  0, 1, 0,  
        
        0, 0, 1,  1, 0, 0,  0, 0, 0,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 0, 0,  0, 0, 1,  1, 0, 0,  
        
        0, 1, 0,  0, 1, 1,  1, 0, 0,  
        0, 1, 1,  0, 0, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(70, [
        0, 0, 0,  0, 1, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 0,  1, 0, 0,  
        1, 1, 1,  0, 0, 1,  0, 0, 0,  
        
        1, 0, 0,  1, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 1,  0, 0, 1,  
        
        0, 0, 0,  1, 0, 0,  1, 1, 1,  
        0, 0, 1,  0, 0, 1,  0, 0, 0,  
        0, 0, 1,  0, 1, 0,  0, 0, 0 
        ])
    .set(71, [
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 1, 1,  1, 0, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 1,  1, 1, 0,  
        
        0, 1, 1,  0, 0, 0,  0, 1, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 1, 0,  0, 0, 0,  1, 1, 0,  
        
        0, 1, 1,  1, 0, 1,  0, 1, 0,  
        0, 0, 1,  0, 0, 1,  1, 1, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(72, [
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        1, 0, 0,  0, 1, 0,  0, 1, 1,  
        
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0 
        ])
    .set(73, [
        0, 0, 0,  1, 0, 1,  1, 0, 0,  
        0, 1, 1,  0, 1, 0,  0, 1, 0,  
        1, 0, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  1, 1, 0,  
        0, 0, 1,  1, 0, 1,  0, 0, 0 
        ])
    .set(74, [
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        
        1, 0, 1,  0, 1, 0,  1, 0, 1,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 1,  0, 1, 0,  1, 0, 1,  
        
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0 
        ])
    .set(75, [
        0, 0, 0,  1, 1, 1,  1, 1, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 0,  
        1, 0, 1,  1, 1, 1,  1, 0, 0,  
        
        1, 0, 1,  0, 0, 0,  0, 0, 1,  
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        1, 0, 0,  0, 0, 0,  1, 0, 1,  
        
        0, 0, 1,  1, 1, 0,  1, 0, 1,  
        0, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 1, 1,  1, 1, 1,  0, 0, 0 
        ])
    .set(76, [
        1, 0, 0,  0, 1, 0,  0, 1, 1,  
        1, 1, 0,  1, 1, 0,  1, 1, 0,  
        0, 1, 1,  1, 0, 0,  1, 0, 0,  
        
        0, 0, 0,  0, 0, 0,  1, 1, 0,  
        1, 1, 0,  0, 0, 0,  0, 1, 1,  
        0, 1, 1,  0, 0, 0,  0, 0, 0,  
        
        0, 0, 1,  0, 0, 1,  1, 1, 0,  
        0, 1, 1,  1, 1, 1,  0, 1, 1,  
        1, 1, 0,  0, 1, 0,  0, 0, 1 
        ])
    .set(77, [
        0, 0, 0,  1, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 0,  1, 0, 1,  
        0, 0, 1,  0, 0, 1,  0, 0, 1,  
        
        0, 0, 1,  0, 0, 1,  0, 1, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 1, 0,  1, 0, 0,  1, 0, 0,  
        
        1, 0, 0,  1, 0, 0,  1, 0, 0,  
        1, 0, 1,  0, 0, 1,  0, 0, 0,  
        0, 0, 1,  0, 0, 1,  0, 0, 0 
        ])
    .set(78, [
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        
        1, 1, 1,  0, 0, 0,  1, 1, 1,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  1, 1, 1,  1, 0, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(79, [
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0 
        ])
    .set(80, [
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        1, 1, 0,  0, 0, 0,  0, 1, 1,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0 
        ])
    .set(81, [
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0 
        ])
    .set(82, [
        0, 0, 0,  0, 1, 1,  1, 0, 0,  
        0, 1, 0,  1, 0, 0,  0, 1, 0,  
        1, 0, 1,  0, 0, 0,  1, 0, 0,  
        
        1, 0, 0,  0, 0, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 0, 0,  0, 0, 1,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 1,  
        0, 1, 0,  0, 0, 1,  0, 1, 0,  
        0, 0, 1,  1, 1, 0,  0, 0, 0 
        ])
    .set(83, [
        0, 0, 0,  0, 0, 0,  1, 1, 0,  
        1, 1, 0,  0, 1, 1,  1, 1, 0,  
        1, 1, 0,  0, 1, 1,  0, 0, 0,  
        
        0, 1, 1,  0, 0, 0,  0, 0, 0,  
        0, 1, 1,  0, 1, 0,  1, 1, 0,  
        0, 0, 0,  0, 0, 0,  1, 1, 0,  
        
        0, 0, 0,  1, 1, 0,  0, 1, 1,  
        0, 1, 1,  1, 1, 0,  0, 1, 1,  
        0, 1, 1,  0, 0, 0,  0, 0, 0 
        ])
    .set(84, [
        0, 0, 1,  0, 1, 1,  0, 1, 0,  
        0, 1, 0,  0, 0, 1,  1, 1, 1,  
        0, 0, 0,  0, 0, 1,  0, 1, 0,  
        
        1, 0, 1,  0, 0, 0,  1, 1, 1,  
        0, 0, 0,  1, 1, 0,  0, 0, 1,  
        1, 0, 0,  0, 1, 0,  0, 0, 0,  
        
        0, 1, 0,  0, 0, 1,  0, 0, 1,  
        1, 0, 1,  0, 0, 0,  0, 1, 0,  
        1, 1, 1,  1, 0, 1,  0, 0, 0 
        ])
    .set(85, [
        0, 0, 1,  1, 0, 0,  0, 0, 0,  
        0, 1, 0,  0, 1, 0,  1, 1, 0,  
        0, 1, 0,  1, 0, 0,  0, 0, 1,  
        
        0, 0, 0,  0, 0, 0,  1, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        1, 0, 1,  0, 0, 0,  0, 0, 0,  
        
        1, 0, 0,  0, 0, 1,  0, 1, 0,  
        0, 1, 1,  0, 1, 0,  0, 1, 0,  
        0, 0, 0,  0, 0, 1,  1, 0, 0 
        ])
    .set(86, [
        0, 0, 0,  1, 1, 1,  0, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        1, 1, 0,  1, 0, 1,  0, 1, 1,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        0, 1, 0,  0, 0, 0,  0, 1, 0 
        ])
    .set(87, [
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        1, 0, 1,  0, 0, 0,  1, 0, 1,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0 
        ])
    .set(88, [
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        
        1, 1, 0,  0, 0, 0,  0, 1, 1,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        1, 1, 0,  0, 0, 0,  0, 1, 1,  
        
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0 
        ])
    .set(89, [
        0, 0, 0,  1, 1, 0,  0, 0, 1,  
        1, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 1, 0,  0, 1, 1,  1, 0, 0,  
        
        1, 0, 0,  0, 1, 0,  1, 0, 0,  
        0, 0, 0,  0, 0, 1,  1, 1, 1,  
        1, 1, 1,  0, 0, 0,  0, 0, 1,  
        
        0, 0, 1,  1, 0, 0,  0, 0, 0,  
        0, 1, 0,  1, 0, 0,  1, 1, 0,  
        0, 0, 0,  1, 0, 1,  1, 1, 0 
        ])
    .set(90, [
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        
        1, 1, 0,  0, 1, 0,  0, 1, 1,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        1, 1, 0,  0, 1, 0,  0, 1, 1,  
        
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1 
        ])
    .set(91, [
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        1, 0, 1,  0, 1, 0,  1, 0, 1,  
        0, 1, 0,  1, 0, 1,  1, 0, 1,  
        
        1, 0, 1,  1, 0, 1,  1, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        1, 0, 1,  1, 0, 1,  1, 0, 1,  
        
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        1, 0, 1,  0, 1, 0,  1, 0, 1,  
        0, 1, 0,  1, 0, 1,  0, 1, 0 
        ])
    .set(92, [
        1, 1, 1,  0, 1, 0,  0, 0, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        1, 0, 1,  1, 0, 1,  0, 1, 0,  
        
        0, 0, 1,  0, 0, 0,  0, 1, 0,  
        1, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 1, 0,  
        
        0, 0, 0,  0, 0, 1,  0, 1, 0,  
        0, 0, 1,  1, 1, 1,  1, 1, 0,  
        0, 1, 0,  0, 0, 0,  0, 0, 1 
        ])
    .set(93, [
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 0, 0,  1, 1, 1,  0, 0, 0,  
        
        0, 1, 0,  1, 1, 1,  0, 1, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  1, 0, 0 
        ])
    .set(94, [
        0, 1, 1,  0, 1, 0,  1, 1, 0,  
        1, 0, 0,  1, 1, 1,  0, 0, 1,  
        1, 0, 1,  0, 1, 0,  1, 0, 1,  
        
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        1, 1, 1,  0, 0, 0,  1, 1, 1,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        
        1, 0, 1,  0, 1, 0,  1, 0, 1,  
        1, 0, 0,  1, 1, 1,  0, 0, 1,  
        0, 1, 1,  0, 1, 0,  1, 1, 0 
        ])
    .set(95, [
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        
        0, 1, 1,  1, 1, 1,  1, 1, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 1, 1,  1, 1, 1,  1, 1, 0,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1 
        ])
    .set(96, [
        1, 0, 0,  1, 1, 1,  0, 0, 1,  
        0, 0, 0,  1, 1, 1,  0, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 1, 1,  1, 0, 1,  1, 1, 0,  
        
        1, 1, 0,  0, 1, 0,  0, 1, 1,  
        1, 1, 0,  0, 0, 0,  0, 1, 1,  
        0, 1, 1,  0, 1, 0,  1, 1, 0 
        ])
    //高级
    .set(97, [
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        1, 0, 1,  0, 1, 0,  1, 0, 1,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0 
        ])
    .set(98, [
        0, 1, 0,  0, 0, 0,  1, 0, 0,  
        1, 0, 0,  1, 0, 0,  0, 0, 1,  
        0, 0, 1,  0, 1, 0,  0, 0, 1,  
        
        0, 0, 1,  0, 0, 0,  0, 1, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 1, 0,  0, 0, 0,  1, 0, 0,  
        
        1, 0, 0,  0, 1, 0,  1, 0, 0,  
        1, 0, 0,  0, 0, 1,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  0, 1, 0 
        ])
    .set(99, [
        0, 0, 0,  0, 0, 1,  1, 0, 0,  
        0, 0, 1,  0, 1, 0,  0, 1, 0,  
        0, 1, 0,  1, 0, 0,  0, 1, 0,  
        
        0, 0, 1,  1, 0, 0,  0, 0, 0,  
        0, 1, 0,  0, 1, 0,  1, 0, 0,  
        1, 0, 0,  0, 0, 1,  0, 1, 0,  
        
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 1,  0, 0, 1,  0, 0, 0,  
        0, 0, 0,  0, 0, 0,  1, 0, 0 
        ])
    .set(100, [
        0, 0, 0,  0, 1, 1,  0, 0, 0,  
        0, 0, 0,  0, 0, 1,  1, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 1, 0,  
        
        0, 0, 0,  1, 0, 0,  0, 1, 1,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        1, 1, 0,  0, 0, 1,  0, 0, 0,  
        
        0, 1, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 1,  1, 0, 0,  0, 0, 0,  
        0, 0, 0,  1, 1, 0,  0, 0, 0 
        ])
    .set(101, [
        0, 0, 1,  0, 0, 0,  0, 0, 1,  
        1, 0, 0,  1, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 0, 1,  1, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  1, 0, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 1,  0, 0, 1,  
        1, 0, 0,  0, 0, 1,  1, 0, 0 
        ])
    .set(102, [
        0, 0, 0,  0, 1, 1,  1, 0, 0,  
        0, 0, 0,  1, 0, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  0, 0, 1,  
        
        0, 1, 0,  0, 0, 1,  0, 0, 1,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        1, 0, 0,  1, 0, 0,  0, 1, 0,  
        
        1, 0, 0,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 0, 1,  0, 0, 0,  
        0, 0, 1,  1, 1, 0,  0, 0, 0 
        ])
    .set(103, [
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 1, 1,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 0,  1, 1, 0,  
        
        0, 0, 0,  1, 0, 1,  1, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  1, 0, 1,  0, 0, 0,  
        
        0, 1, 1,  0, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  1, 1, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0 
        ])
    .set(104, [
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 1,  0, 1, 0 
        ])
    .set(105, [
        0, 0, 1,  1, 1, 0,  0, 0, 0,  
        0, 1, 0,  0, 0, 1,  0, 0, 0,  
        1, 0, 0,  0, 0, 0,  1, 0, 0,  
        
        1, 0, 0,  1, 0, 0,  1, 0, 0,  
        1, 0, 0,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 0, 1,  0, 0, 1,  
        
        0, 0, 1,  1, 1, 0,  1, 0, 1,  
        0, 0, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 0,  0, 0, 1,  1, 0, 0 
        ])
    .set(106, [
        0, 0, 0,  0, 0, 1,  0, 0, 0,  
        0, 0, 1,  0, 0, 1,  1, 0, 0,  
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        
        1, 1, 0,  0, 0, 1,  0, 0, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 0, 0,  1, 0, 0,  0, 1, 1,  
        
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        0, 0, 1,  1, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 0,  0, 0, 0 
        ])
    .set(107, [
        1, 0, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  1, 0, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 0, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 0, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 0, 1,  0, 1, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 1,  1, 0, 0,  
        1, 1, 0,  0, 0, 0,  0, 0, 1 
        ])
    .set(108, [
        0, 0, 1,  1, 0, 0,  0, 0, 0,  
        0, 1, 0,  0, 0, 1,  1, 0, 0,  
        0, 1, 0,  1, 0, 0,  0, 1, 0,  
        
        0, 0, 0,  0, 0, 1,  0, 1, 0,  
        0, 1, 1,  0, 0, 0,  0, 0, 0,  
        1, 0, 0,  1, 0, 0,  1, 0, 1,  
        
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 0,  0, 1, 0,  1, 1, 0,  
        0, 0, 1,  1, 0, 0,  0, 0, 0 
        ])
    .set(109, [
        0, 1, 0,  1, 0, 0,  0, 0, 1,  
        1, 0, 0,  1, 0, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        
        1, 1, 0,  0, 0, 1,  0, 0, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 0, 0,  1, 0, 0,  0, 1, 1,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 0, 1,  0, 0, 1,  
        1, 0, 0,  0, 0, 1,  0, 1, 0 
        ])
    .set(110, [
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        1, 1, 0,  0, 0, 1,  1, 0, 0,  
        0, 0, 1,  1, 0, 0,  0, 0, 0,  
        
        0, 0, 1,  0, 0, 0,  0, 0, 0,  
        1, 0, 0,  0, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 0,  0, 0, 1,  1, 1, 0 
        ])
    .set(111, [
        0, 1, 1,  0, 0, 0,  0, 0, 0,  
        1, 0, 0,  1, 0, 0,  0, 0, 0,  
        1, 0, 0,  1, 0, 0,  0, 0, 0,  
        
        1, 0, 0,  1, 0, 0,  0, 0, 0,  
        0, 1, 1,  0, 0, 0,  0, 0, 0,  
        0, 0, 0,  0, 0, 1,  1, 1, 0,  
        
        0, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 0,  0, 0, 1,  1, 1, 0 
        ])
    .set(112, [
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 0, 0,  1, 0, 1,  1, 0, 1,  
        0, 0, 0,  1, 0, 1,  1, 0, 1,  
        
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        1, 0, 0,  0, 0, 0,  0, 0, 1 
        ])
    .set(113, [
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 0, 0,  0, 0, 0,  0, 1, 1,  
        0, 0, 1,  1, 0, 0,  0, 1, 1,  
        
        0, 0, 1,  1, 0, 0,  0, 1, 1,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        1, 1, 0,  0, 0, 1,  1, 0, 0,  
        
        1, 1, 0,  0, 0, 1,  1, 0, 0,  
        1, 1, 0,  0, 0, 0,  0, 0, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(114, [
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 1, 1,  0, 0, 1,  1, 0, 0,  
        0, 0, 1,  1, 0, 0,  1, 1, 0,  
        
        0, 0, 0,  1, 1, 0,  0, 1, 0,  
        0, 0, 0,  0, 0, 1,  0, 0, 0,  
        0, 1, 1,  0, 0, 1,  1, 0, 0,  
        
        0, 0, 1,  1, 0, 0,  1, 1, 0,  
        0, 0, 1,  1, 0, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(115, [
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 0, 1,  1, 0, 1,  1, 1, 0,  
        0, 0, 0,  1, 1, 0,  1, 1, 0,  
        
        0, 0, 0,  0, 1, 1,  0, 1, 0,  
        0, 0, 0,  1, 0, 1,  1, 0, 0,  
        0, 0, 1,  0, 1, 0,  1, 1, 0,  
        
        0, 1, 0,  1, 0, 0,  0, 1, 0,  
        1, 0, 1,  0, 0, 0,  0, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(116, [
        0, 0, 0,  0, 0, 1,  0, 0, 0,  
        0, 0, 1,  0, 1, 1,  0, 0, 0,  
        0, 1, 1,  0, 0, 0,  1, 0, 0,  
        
        0, 0, 0,  1, 0, 0,  0, 1, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        1, 1, 0,  0, 0, 1,  0, 0, 0,  
        
        0, 0, 1,  0, 0, 0,  1, 1, 0,  
        0, 0, 0,  1, 1, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 0,  0, 0, 0 
        ])
    .set(117, [
        1, 0, 0,  0, 0, 0,  1, 0, 0,  
        0, 1, 1,  1, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 1,  
        
        0, 1, 0,  0, 0, 0,  0, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  0, 0, 0,  0, 1, 0,  
        
        1, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 1,  1, 1, 0,  
        0, 0, 1,  0, 0, 0,  0, 0, 1 
        ])
    .set(118, [
        0, 0, 0,  1, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        1, 0, 1,  0, 0, 0,  0, 0, 1,  
        
        0, 0, 0,  1, 0, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 0, 1,  0, 0, 0,  
        
        1, 0, 0,  0, 0, 0,  1, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 1,  0, 0, 0 
        ])
    .set(119, [
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 0,  1, 1, 0,  1, 1, 0,  
        0, 0, 0,  1, 0, 0,  0, 0, 0,  
        
        1, 0, 0,  0, 0, 0,  1, 0, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 0, 1,  0, 0, 0,  0, 0, 1,  
        
        0, 0, 0,  0, 0, 1,  0, 0, 0,  
        0, 1, 1,  0, 1, 1,  0, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0 
        ])
    .set(120, [
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 1,  1, 1, 0 
        ])
    .set(121, [
        0, 0, 0,  0, 0, 0,  1, 1, 0,  
        0, 1, 1,  1, 0, 0,  0, 0, 1,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        
        0, 1, 0,  0, 0, 1,  0, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 0,  0, 1, 0,  
        
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        1, 0, 0,  0, 0, 1,  1, 1, 0,  
        0, 1, 1,  0, 0, 0,  0, 0, 0 
        ])
    .set(122, [
        0, 0, 0,  1, 1, 0,  0, 0, 0,  
        0, 1, 1,  0, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        
        0, 1, 0,  1, 0, 0,  0, 0, 1,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        1, 0, 0,  0, 0, 1,  0, 1, 0,  
        
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 0,  1, 1, 0,  
        0, 0, 0,  0, 1, 1,  0, 0, 0 
        ])
    .set(123, [
        1, 1, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 0,  0, 1, 1,  1, 1, 0,  
        0, 0, 0,  0, 0, 0,  0, 1, 0,  
        
        0, 0, 0,  0, 0, 1,  0, 1, 0,  
        0, 1, 1,  1, 1, 0,  0, 1, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        
        0, 0, 1,  0, 1, 0,  0, 0, 0,  
        1, 1, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  0, 0, 0,  0, 0, 1 
        ])
    .set(124, [
        0, 0, 1,  1, 0, 0,  0, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 0, 0,  
        0, 1, 0,  0, 0, 0,  1, 1, 0,  
        
        0, 0, 0,  1, 0, 1,  0, 0, 1,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        1, 0, 0,  1, 0, 1,  0, 0, 0,  
        
        0, 1, 1,  0, 0, 0,  0, 1, 0,  
        0, 0, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 0,  0, 0, 1,  1, 0, 0 
        ])
    .set(125, [
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 1, 1,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 0,  1, 1, 0,  
        
        0, 0, 0,  1, 0, 1,  1, 0, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 0, 1,  1, 0, 1,  0, 0, 0,  
        
        0, 0, 1,  0, 0, 1,  1, 1, 0,  
        0, 1, 0,  0, 0, 0,  1, 1, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0 
        ])
    .set(126, [
        0, 0, 1,  1, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 0, 1,  1, 0, 0,  0, 0, 1,  
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        1, 0, 0,  0, 0, 1,  1, 0, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 1,  1, 0, 0 
        ])
    .set(127, [
        0, 0, 0,  0, 1, 0,  1, 0, 1,  
        0, 0, 0,  0, 0, 1,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        
        0, 1, 0,  1, 0, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 1,  0, 0, 1,  0, 1, 0,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 0,  0, 0, 0,  
        1, 0, 1,  0, 1, 0,  0, 0, 0 
        ])
    .set(128, [
        1, 0, 0,  1, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        
        1, 0, 0,  1, 0, 0,  0, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 0,  0, 0, 1,  0, 0, 1,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 1,  0, 0, 1 
        ])
    .set(129, [
        0, 1, 0,  0, 1, 0,  0, 0, 0,  
        1, 0, 0,  1, 0, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        
        0, 0, 0,  0, 0, 1,  0, 0, 0,  
        0, 1, 1,  0, 0, 0,  0, 0, 1,  
        1, 0, 0,  1, 0, 0,  0, 1, 0,  
        
        1, 0, 0,  0, 1, 0,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 1,  1, 0, 0,  0, 1, 0 
        ])
    .set(130, [
        0, 0, 0,  1, 0, 1,  1, 0, 0,  
        0, 0, 1,  0, 0, 0,  0, 1, 1,  
        0, 1, 0,  0, 0, 0,  0, 0, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 0, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 0, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 0, 0,  0, 0, 0,  0, 1, 0,  
        1, 1, 0,  0, 0, 0,  1, 0, 0,  
        0, 0, 1,  1, 0, 1,  0, 0, 0 
        ])
    .set(131, [
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0 
        ])
    .set(132, [
        0, 0, 0,  0, 0, 1,  1, 0, 0,  
        0, 1, 1,  1, 0, 0,  0, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        
        0, 1, 0,  0, 0, 1,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        1, 0, 0,  1, 0, 0,  0, 1, 0,  
        
        1, 0, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 0,  0, 0, 1,  1, 1, 0,  
        0, 0, 1,  1, 0, 0,  0, 0, 0 
        ])
    .set(133, [
        0, 0, 1,  1, 0, 0,  0, 1, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  1, 0, 0,  
        
        0, 0, 1,  1, 0, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 0, 1,  1, 0, 0,  
        
        0, 0, 1,  0, 1, 0,  0, 1, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  0, 0, 1,  1, 0, 0 
        ])
    .set(134, [
        0, 0, 0,  0, 1, 1,  0, 1, 1,  
        0, 0, 1,  0, 0, 1,  0, 0, 1,  
        0, 1, 1,  0, 0, 0,  0, 0, 0,  
        
        0, 0, 0,  0, 0, 0,  0, 1, 1,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        1, 1, 0,  0, 0, 0,  0, 0, 0,  
        
        0, 0, 0,  0, 0, 0,  1, 1, 0,  
        1, 0, 0,  1, 0, 0,  1, 0, 0,  
        1, 1, 0,  1, 1, 0,  0, 0, 0 
        ])
    .set(135, [
        0, 0, 0,  0, 1, 1,  0, 0, 0,  
        0, 0, 0,  0, 0, 1,  0, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        
        0, 0, 0,  1, 0, 0,  0, 1, 1,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        1, 1, 0,  0, 0, 1,  0, 0, 0,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 0,  0, 0, 0,  
        0, 0, 0,  1, 1, 0,  0, 0, 0 
        ])
    .set(136, [
        0, 1, 1,  0, 0, 1,  1, 0, 0,  
        1, 0, 0,  0, 1, 0,  0, 1, 0,  
        1, 0, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 0, 1,  0, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 1,  1, 0, 0,  1, 1, 0 
        ])
    .set(137, [
        1, 0, 0,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 0, 1,  0, 1, 0,  
        0, 1, 0,  0, 1, 0,  1, 0, 0,  
        
        0, 1, 0,  0, 1, 1,  0, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 0,  1, 1, 0,  0, 1, 0,  
        
        0, 0, 1,  0, 1, 0,  0, 1, 0,  
        0, 1, 0,  1, 0, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  0, 0, 1 
        ])
    .set(138, [
        0, 0, 0,  0, 1, 1,  1, 1, 0,  
        0, 0, 1,  1, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 0, 1,  1, 0, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 0, 1,  1, 0, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 1,  1, 0, 0,  
        0, 1, 1,  1, 1, 0,  0, 0, 0 
        ])
    .set(139, [
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  1, 0, 0 
        ])
    .set(140, [
        0, 0, 0,  0, 0, 1,  0, 0, 0,  
        0, 0, 1,  1, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 1,  1, 1, 0,  0, 0, 1,  
        1, 0, 0,  0, 0, 1,  0, 1, 0,  
        
        0, 1, 0,  0, 0, 0,  1, 0, 0,  
        0, 0, 1,  0, 0, 1,  0, 0, 0,  
        0, 0, 0,  1, 1, 0,  0, 0, 0 
        ])
    .set(141, [
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1 
        ])
    .set(142, [
        0, 0, 0,  0, 0, 0,  0, 1, 0,  
        0, 1, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 0,  1, 1, 1,  1, 0, 0,  
        
        0, 0, 1,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 0, 1,  0, 0, 1,  0, 0, 0,  
        
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        1, 0, 0,  1, 0, 0,  0, 1, 0,  
        0, 1, 0,  0, 0, 0,  0, 0, 1 
        ])
    .set(143, [
        0, 0, 1,  0, 0, 1,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  0, 0, 1,  
        1, 0, 0,  1, 0, 0,  0, 1, 0,  
        
        0, 0, 0,  0, 1, 1,  1, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  1, 1, 0,  0, 0, 0,  
        
        0, 1, 0,  0, 0, 1,  0, 0, 1,  
        1, 0, 0,  0, 0, 0,  1, 0, 0,  
        1, 0, 0,  1, 0, 0,  1, 0, 0 
        ])
    .set(144, [
        0, 1, 0,  1, 0, 0,  1, 0, 0,  
        1, 0, 0,  0, 1, 0,  0, 1, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        
        0, 1, 0,  1, 0, 0,  0, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  0, 0, 1,  0, 1, 0,  
        
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 1,  0, 0, 1,  0, 1, 0 
        ])
    //专家
    .set(145, [
        0, 1, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 1,  0, 0, 1,  0, 0, 0,  
        0, 0, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 0, 0,  1, 0, 0,  1, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        1, 0, 1,  0, 0, 1,  0, 0, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 0, 0,  
        0, 0, 0,  1, 0, 0,  1, 1, 0,  
        0, 0, 9,  0, 0, 0,  1, 1, 0 
        ])
    .set(146, [
        0, 0, 1,  1, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        1, 0, 0,  0, 1, 0,  0, 1, 0,  
        
        1, 0, 0,  0, 0, 1,  1, 0, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 0, 1,  1, 0, 0,  0, 0, 1,  
        
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        1, 0, 0,  0, 3, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 1,  1, 0, 0 
        ])
    .set(147, [
        0, 1, 0,  0, 1, 0,  0, 0, 0,  
        1, 0, 0,  1, 0, 0,  0, 0, 0,  
        0, 0, 1,  0, 0, 0,  1, 1, 0,  
        
        0, 1, 0,  0, 0, 1,  0, 0, 1,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        1, 0, 0,  1, 0, 0,  0, 1, 0,  
        
        0, 1, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  0, 0, 1,  0, 0, 1,  
        0, 0, 0,  0, 1, 0,  0, 1, 0 
        ])
    .set(148, [
        0, 0, 0,  0, 0, 0,  1, 1, 0,  
        0, 1, 1,  1, 0, 0,  0, 0, 0,  
        0, 1, 0,  1, 0, 0,  0, 0, 1,  
        
        0, 1, 1,  1, 0, 0,  0, 0, 1,  
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        1, 0, 0,  0, 0, 1,  1, 1, 0,  
        
        1, 0, 0,  0, 0, 1,  0, 1, 0,  
        0, 0, 0,  0, 0, 1,  1, 1, 0,  
        0, 1, 1,  0, 0, 0,  0, 0, 0 
        ])
    .set(149, [
        0, 0, 0,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  0, 0, 1,  1, 1, 0,  
        0, 0, 0,  0, 1, 1,  0, 1, 1,  
        
        0, 0, 0,  0, 0, 1,  1, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 1,  1, 0, 0,  0, 0, 0,  
        
        1, 1, 0,  1, 1, 0,  0, 0, 0,  
        0, 1, 1,  1, 0, 0,  0, 0, 0,  
        0, 0, 1,  0, 0, 0,  0, 0, 0 
        ])
    .set(150, [
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        1, 0, 0,  1, 1, 1,  0, 0, 1,  
        
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0 
        ])
    .set(151, [
        0, 0, 0,  0, 0, 1,  0, 0, 0,  
        0, 0, 1,  1, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 1,  1, 1, 0,  0, 0, 1,  
        1, 0, 0,  0, 0, 1,  0, 1, 0,  
        
        0, 1, 0,  0, 0, 0,  1, 0, 0,  
        0, 0, 1,  0, 0, 1,  0, 1, 0,  
        0, 0, 0,  1, 1, 0,  0, 0, 1 
        ])
    .set(152, [
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 1, 1,  1, 0, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 1, 1,  
        
        0, 1, 1,  1, 0, 0,  0, 1, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 1, 0,  0, 0, 1,  1, 1, 0,  
        
        1, 1, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 0, 1,  1, 1, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(153, [
        0, 0, 0,  0, 0, 0,  0, 1, 1,  
        0, 0, 0,  0, 0, 0,  1, 1, 1,  
        0, 0, 0,  0, 0, 1,  0, 1, 0,  
        
        0, 0, 0,  0, 1, 1,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        0, 0, 1,  1, 1, 0,  0, 0, 0,  
        
        0, 1, 0,  1, 0, 0,  0, 0, 0,  
        1, 1, 1,  0, 0, 0,  0, 0, 0,  
        1, 1, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(154, [
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 1, 1,  1, 0, 1,  1, 1, 0,  
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        
        0, 1, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0 
        ])
    .set(155, [
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        0, 0, 0,  1, 1, 1,  0, 0, 0 
        ])
    .set(156, [
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 1, 1,  1, 0, 0,  1, 1, 0,  
        0, 1, 0,  1, 0, 0,  0, 1, 0,  
        
        0, 0, 0,  1, 0, 1,  1, 1, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 1, 1,  1, 0, 1,  0, 0, 0,  
        
        0, 1, 0,  0, 0, 1,  0, 1, 0,  
        0, 1, 1,  0, 0, 1,  1, 1, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(157, [
        0, 0, 1,  0, 0, 0,  0, 1, 0,  
        0, 1, 0,  0, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 1,  0, 0, 1,  
        
        0, 0, 0,  0, 1, 1,  0, 0, 0,  
        0, 0, 0,  1, 0, 0,  1, 0, 0,  
        0, 1, 0,  1, 0, 0,  1, 0, 1,  
        
        0, 1, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  0, 1, 0,  
        0, 0, 0,  1, 0, 1,  1, 0, 0 
        ])
    .set(158, [
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 0,  1, 0, 0,  0, 0, 0,  
        0, 0, 1,  0, 1, 1,  1, 0, 0,  
        
        0, 1, 0,  1, 0, 0,  1, 0, 0,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 0, 1,  0, 0, 1,  0, 1, 0,  
        
        0, 0, 1,  1, 1, 0,  1, 0, 0,  
        0, 0, 0,  0, 0, 1,  0, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 1 
        ])
    .set(159, [
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 1, 1,  0, 0, 0 
        ])
    .set(160, [
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 0,  1, 1, 1,  0, 0, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1 
        ])
    .set(161, [
        0, 0, 1,  1, 0, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 0, 1,  
        
        0, 1, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 1, 0,  
        
        1, 0, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  1, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 0, 1,  1, 0, 0 
        ])
    .set(162, [
        1, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 1, 0,  0, 0, 1,  1, 0, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        
        1, 0, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 0,  0, 0, 1,  1, 0, 0,  
        0, 1, 1,  0, 0, 0,  0, 0, 0,  
        
        1, 0, 0,  1, 0, 0,  0, 0, 0,  
        1, 0, 0,  1, 0, 0,  1, 1, 0,  
        0, 1, 1,  0, 1, 1,  0, 0, 1 
        ])
    .set(163, [
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 1, 1,  1, 0, 1,  0, 1, 0,  
        0, 1, 0,  1, 0, 0,  1, 0, 0,  
        
        0, 1, 1,  1, 0, 1,  0, 1, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 1, 0,  1, 0, 1,  1, 1, 0,  
        
        0, 0, 1,  0, 0, 1,  0, 1, 0,  
        0, 1, 0,  1, 0, 1,  1, 1, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(164, [
        0, 1, 0,  0, 0, 1,  1, 0, 0,  
        1, 0, 0,  1, 0, 0,  1, 0, 0,  
        0, 0, 1,  0, 1, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 0, 1,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  0, 1, 0,  
        1, 0, 0,  1, 0, 0,  1, 0, 0,  
        
        0, 1, 0,  0, 0, 1,  0, 0, 0,  
        0, 0, 1,  0, 1, 0,  0, 1, 0,  
        0, 0, 0,  1, 0, 0,  0, 0, 0 
        ])
    .set(165, [
        0, 1, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 1,  0, 1, 0,  0, 0, 0,  
        0, 1, 0,  1, 0, 0,  0, 0, 0,  
        
        1, 0, 1,  0, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 0,  1, 0, 1,  
        
        0, 0, 0,  0, 0, 1,  0, 1, 0,  
        0, 0, 0,  0, 1, 0,  1, 0, 1,  
        0, 0, 0,  1, 0, 1,  0, 1, 0 
        ])
    .set(166, [
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 1,  
        
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 0, 1,  0, 0, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  1, 0, 0 
        ])
    .set(167, [
        0, 0, 1,  1, 0, 0,  0, 0, 0,  
        1, 0, 0,  0, 0, 0,  0, 0, 0,  
        1, 0, 0,  0, 0, 1,  1, 1, 0,  
        
        1, 0, 0,  0, 0, 0,  0, 0, 0,  
        1, 0, 0,  1, 1, 1,  0, 0, 1,  
        0, 0, 0,  0, 0, 0,  0, 0, 1,  
        
        0, 1, 1,  1, 0, 0,  0, 0, 1,  
        0, 0, 0,  0, 0, 0,  0, 0, 1,  
        0, 0, 0,  0, 1, 1,  1, 0, 0 
        ])
    .set(168, [
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 0, 0,  1, 1, 1,  0, 0, 0,  
        0, 0, 1,  1, 1, 1,  1, 0, 0,  
        
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        0, 1, 1,  0, 0, 0,  1, 1, 0,  
        
        0, 0, 1,  1, 0, 1,  1, 0, 0,  
        0, 0, 0,  1, 1, 1,  0, 0, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0 
        ])
    .set(169, [
        0, 0, 0,  0, 1, 1,  1, 0, 0,  
        0, 0, 0,  0, 0, 0,  0, 1, 0,  
        0, 0, 1,  1, 1, 0,  0, 0, 1,  
        
        0, 1, 0,  0, 0, 1,  0, 0, 1,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        1, 0, 0,  1, 0, 0,  0, 1, 0,  
        
        1, 0, 0,  0, 1, 1,  1, 0, 0,  
        0, 1, 0,  0, 0, 0,  0, 0, 0,  
        0, 0, 1,  1, 1, 0,  0, 0, 0 
        ])
    .set(170, [
        0, 0, 1,  0, 1, 0,  0, 0, 0,  
        0, 1, 1,  1, 1, 0,  0, 0, 0,  
        0, 1, 1,  1, 0, 0,  0, 1, 0,  
        
        0, 0, 0,  0, 0, 0,  0, 1, 1,  
        1, 0, 0,  0, 0, 0,  0, 0, 1,  
        1, 1, 0,  0, 0, 0,  0, 0, 0,  
        
        0, 1, 0,  0, 0, 1,  0, 1, 0,  
        0, 0, 0,  0, 1, 1,  1, 1, 0,  
        0, 0, 0,  0, 1, 1,  1, 0, 0 
        ])
    .set(171, [
        0, 0, 0,  1, 0, 1,  0, 1, 0,  
        0, 0, 0,  0, 1, 0,  1, 0, 1,  
        0, 0, 0,  0, 0, 1,  0, 1, 0,  
        
        1, 0, 0,  0, 0, 0,  1, 0, 1,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        1, 0, 1,  0, 0, 0,  0, 0, 1,  
        
        0, 1, 0,  1, 0, 0,  0, 0, 0,  
        1, 0, 1,  0, 1, 0,  0, 0, 0,  
        0, 1, 0,  1, 0, 1,  0, 0, 0 
        ])
    .set(172, [
        0, 0, 1,  1, 1, 0,  0, 0, 0,  
        0, 1, 0,  0, 0, 1,  0, 0, 0,  
        1, 0, 0,  0, 0, 1,  0, 0, 0,  
        
        1, 0, 0,  0, 0, 1,  1, 1, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 0,  1, 0, 0,  0, 0, 1,  
        
        0, 0, 1,  0, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        1, 0, 0,  0, 1, 1,  1, 0, 0 
        ])
    .set(173, [
        0, 1, 1,  0, 0, 0,  1, 0, 0,  
        1, 0, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 0,  1, 0, 0,  0, 0, 1,  
        
        0, 1, 1,  0, 0, 0,  0, 1, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 1, 0,  0, 0, 0,  1, 1, 0,  
        
        1, 0, 0,  0, 0, 1,  0, 0, 1,  
        0, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 0, 1,  0, 0, 0,  1, 1, 0 
        ])
    .set(174, [
        1, 0, 0,  0, 1, 0,  0, 0, 1,  
        0, 0, 0,  1, 0, 1,  0, 0, 1,  
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        1, 0, 1,  0, 1, 0,  1, 0, 1,  
        0, 1, 0,  0, 0, 0,  0, 1, 0,  
        
        0, 0, 1,  0, 1, 0,  1, 0, 0,  
        0, 0, 0,  1, 0, 1,  0, 0, 0,  
        1, 0, 0,  0, 1, 0,  0, 0, 1 
        ])
    .set(175, [
        0, 0, 1,  1, 0, 0,  0, 0, 1,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 1, 0,  0, 0, 1,  1, 0, 0,  
        
        0, 0, 1,  1, 0, 0,  0, 0, 0,  
        0, 0, 0,  0, 1, 0,  0, 0, 0,  
        0, 0, 0,  0, 0, 1,  1, 0, 0,  
        
        0, 0, 1,  1, 0, 0,  0, 1, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        1, 0, 0,  0, 0, 1,  1, 0, 0 
        ])
    .set(176, [
        0, 0, 0,  0, 0, 0,  0, 0, 0,  
        0, 0, 1,  1, 1, 0,  1, 0, 0,  
        0, 1, 1,  1, 0, 0,  1, 1, 0,  
        
        0, 0, 0,  0, 0, 0,  1, 1, 0,  
        0, 1, 0,  0, 1, 0,  0, 1, 0,  
        0, 1, 1,  0, 0, 0,  0, 0, 0,  
        
        0, 1, 1,  0, 0, 1,  1, 1, 0,  
        0, 0, 1,  0, 1, 1,  1, 0, 0,  
        0, 0, 0,  0, 0, 0,  0, 0, 0 
        ])

    /*
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])
    .set(0, [
        1, 1, 1,  1, 1, 1,  1, 1, 1,
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1,

        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1, 
        1, 1, 1,  1, 1, 1,  1, 1, 1
    ])*/


    //256
    solution = [
        [2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5]
        ,[5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5]
        ,[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ,[4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6]
        ,[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5]
        ,[2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8]
        ,[2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8]
        ,[2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ,[4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7]
        ,[5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3]
        ,[5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6]
        ,[1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5]
        ,[4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3]
        ,[1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5]
        ,[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2]
        ,[1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6]
        ,[3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2]
        ,[3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3]
        ,[2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7]
        ,[5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4]
        ,[3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4]
        ,[1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3]
        ,[8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2]
        ,[4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ,[3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1]
        ,[1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5]
        ,[1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5]
        ,[4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3]
        ,[3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3]
        ,[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6]
        ,[2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8]
        ,[5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5]
        ,[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2]
        ,[4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8]
        ,[3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4]
        ,[8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1]
        ,[5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8]
        ,[5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2]
        ,[2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6]
        ,[4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3]
        ,[8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5]
        ,[1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8]
        ,[5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ,[8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5]
        ,[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7]
        ,[5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5]
        ,[1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7]
        ,[7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5]
        ,[2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ,[2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3]
        ,[1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1]
        ,[4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ,[3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4]
        ,[9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3]
        ,[5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6]
        ,[6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7]
        ,[4, 5, 6, 1, 2, 3, 7, 8, 9, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 5, 6, 7, 2, 3, 4, 8, 9, 1, 8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 6, 7, 8, 3, 4, 5, 9, 1, 2, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8]
        ,[1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ,[4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2]
        ,[3, 4, 5, 6, 7, 8, 9, 1, 2, 6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 7, 8, 9, 1, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7]
        ,[6, 7, 8, 9, 1, 2, 3, 4, 5, 9, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 1, 2, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 1, 2, 3, 4, 8, 9, 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 9, 1]]
}
