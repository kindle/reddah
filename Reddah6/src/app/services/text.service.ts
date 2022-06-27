import { Injectable } from '@angular/core';
import { createAnimation, ToastController } from '@ionic/angular';
import { I18nService } from './i18n.service';

import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class TextService {

    constructor(
        private i18n: I18nService,
        private toastController: ToastController,
        ) { }

    getFirstImage(link){
        if(link!=null)
            link = link.split('$$$')[0];
        return link;
    }

    getImageUrl(link){
        if(link!=null)
            link = link
            .replace("login.reddah.com/uploadPhoto",
            "reddah.blob.core.windows.net/photo")
            .replace("reddah.com/uploadPhoto",
            "reddah.blob.core.windows.net/photo")
            .replace("///","https://");
        return link;
    }


    shortCount(n){
        if(n>10000)
            return Math.floor(n/10000)+"w";
        else if(n>1000)
            return Math.floor(n/1000)+"k";
        else
            return n;
    }

    summaryShort(str: string, n: number, fix: string,  locale='en-US') {
        if(locale==null)
            locale='en-US';
        locale = locale.toLowerCase();
        if(!this.i18n.doubleByteLocale.includes(locale))
            n = 2*n;
        str = this.htmlDecode(str)
            
        if(str.startsWith("<br>"))
            str = str.replace("<br>", "");
        str = str.replace(/<br\s*\/?>/gi,' ');
        return this.subpost(str, n, fix);
    }

    htmlDecode(text: string) {
        var temp = document.createElement("div");
        temp.innerHTML = text;
        var output = temp.innerText || temp.textContent;
        temp = null;
        
        output = output.replace(/\"\/uploadPhoto/g, "\"\/\/\/reddah.com\/uploadPhoto");
        output = output.replace(/\"\/\/\/reddah.com\/uploadPhoto/g, "\"https:\/\/reddah.com\/uploadPhoto");
        output = output.replace(/\"\/\/\/login.reddah.com\/uploadPhoto/g, "\"https:\/\/login.reddah.com\/uploadPhoto");
        
        return output;
    }

    htmlDecode2(text: string) {
        return this.htmlDecode(this.htmlDecode(text));
    }

    subpost(str: string, n: number, sufix="...") {
        var r = /[^\u4e00-\u9fa5]/g;
        if (str.replace(r, "mm").length <= n) { return str; }
        var m = Math.floor(n/2);
        for (var i = m; i < str.length; i++) {
            if (str.substr(0, i).replace(r, "mm").length >= n) {
                return str.substr(0, i) + sufix;
            }
        }
        return str;
    }

    async toast(message: string, color="dark", style="toast-style") {
        const toast = await this.toastController.create({
            message: message,
            //showCloseButton: true,
            position: "top",
            //closeButtonText: this.translate.instant("Button.Close"),
            duration: 1000,
            color: color,
            cssClass: style,
        });
        toast.present();
    }

    async toastWithAnimation(message: string, color="dark", style="toast-style") {
        const toast = await this.toastController.create({
            message: message,
            animated:true,
            position: "top",
            duration: 1000,
            color: color,
            cssClass: style,
            enterAnimation: this.enterAnimation,
            //leaveAnimation: this.leaveAnimation
        });
        toast.present();
    }

    enterAnimation = () => {
        const backdropAnimation = createAnimation()
          .addElement(document.querySelector('ion-backdrop')!)
          .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');
  
        const wrapperAnimation = createAnimation()
          .addElement(document.querySelector('.toast-wrapper')!)
          .keyframes([
            { offset: 0, opacity: '0', transform: 'scale(0)' },
            { offset: 1, opacity: '0.99', transform: 'scale(1)' }
          ]);
  
        return createAnimation()
          .addElement(document)
          .easing('ease-out')
          .duration(3000)
          .addAnimation([backdropAnimation, wrapperAnimation]);
    }
  
    leaveAnimation = () => {
        return this.enterAnimation().direction('reverse');
    }


    loadingEffect = [
        `<div class='spinner-eff spinner-eff-1'>
            <div class='bar bar-top'></div>
            <div class='bar bar-right'></div>
            <div class='bar bar-bottom'></div>
            <div class='bar bar-left'></div>
        </div>`,
        `<div class='spinner-eff spinner-eff-2'>
            <div class="square"></div>
        </div>`,
        `<div class="spinner-eff spinner-eff-3">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
        </div>`,
        `<div class="spinner-eff spinner-eff-4">
            <div class="bar bar-top"></div>
            <div class="bar bar-right"></div>
            <div class="bar bar-bottom"></div>
            <div class="bar bar-left"></div>
        </div>`,
        `<div class="spinner-eff spinner-eff-5">
            <div class="ellipse"></div>
        </div>`
    ];
    
    getLoadingEffect(n=null){
        if(n!=null)
            return this.loadingEffect[n];
        
        let loadingRandom = Math.floor((Math.random()*5)+1);
        return this.loadingEffect[loadingRandom-1];
    }


    async Browser(u){
        await Browser.open({ url: u });
    }

    async bingSearch(u){
        await Browser.open({ url: "https://bing.com/search?q="+u });
    }

    generateUserName(){
        const prefix = "rd";
        let name = prefix + this.nonce_str().substring(0,6);

        return name;
    }

    nonce_str() {
        return 'xxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 10 | 0, v = r;
            return v.toString(10);
        });
    }

    isMobile(){
        return Capacitor.getPlatform()=="android"||Capacitor.getPlatform()=="ios";
    }

    isAndroid(){
        return Capacitor.getPlatform()=="android";
    }

    isIos(){
        return Capacitor.getPlatform()=="ios";
    }
}
