import { Component, OnInit, Input, SecurityContext, ViewEncapsulation, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { ModalController, Content, Platform } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope/ngx';


@Component({
    selector: 'app-mini-viewer',
    templateUrl: './mini-viewer.component.html',
    styleUrls: ['./mini-viewer.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class MiniViewerComponent implements OnInit {

    @ViewChild('mini') mini: Content;
    
    @Input() content;//html
    @Input() guid;//article.userName

    html;

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        public sanitizer: DomSanitizer,
        private webView: WebView,
        private iab: InAppBrowser,
        private _renderer2: Renderer2, 
        private gyroscope: Gyroscope,
        private platform: Platform,
        @Inject(DOCUMENT) private _document: Document
    ) {
    }

    ngOnInit() {
        let text = this.reddah.htmlDecode(this.content);
        
        this.html = this.sanitizer.bypassSecurityTrustHtml(text);
        
        this.addScriptByUrl(`https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js`);
        this.addScriptByUrl("https://wow.techbrood.com/libs/zepto.1.1.4.min.js");
        this.addScriptByUrl("https://wow.techbrood.com/uploads/150101/jsapi_share.js");
        this.addScriptByUrl("https://wow.techbrood.com/uploads/150101/head.min.js");
        
        //this.addScript(`https://wow.techbrood.com/uploads/140928/fruit-ninjia.js`);

        //this.addScript(`https://reddah.com/100.js`);//sudo
        //this.addScriptByUrl(`https://reddah.com/101.js`);//doodle jump

        //this.addScriptByUrl(`https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js`);
        
        /*
        let jstext = this.reddah.htmlDecode(this.js);
        let safejs = this.sanitizer.bypassSecurityTrustScript(jstext);
        this.addScriptByText(safejs);*/
        if(this.platform.is('cordova')){
            this.gyroCurrent();
        }
    }

    xOrient=0;
    yOrient;
    zOrient;
    timestamp;

    gyroCurrent(){
        let options: GyroscopeOptions = {
            frequency: 1000
        };

        this.gyroscope.getCurrent(options)
        .then((orientation: GyroscopeOrientation) => {
            
           this.xOrient=orientation.x;
           this.yOrient=orientation.y;
           this.zOrient=orientation.z;
           this.timestamp=orientation.timestamp;
   
         })
        .catch(err=>{
            alert(JSON.stringify(err))
        })

        this.gyroscope.watch()
        .subscribe((orientation: GyroscopeOrientation) => {
            this.xOrient=orientation.x;
            this.yOrient=orientation.y;
            this.zOrient=orientation.z;
            this.timestamp=orientation.timestamp;
        });
    }



    ionViewDidEnter(){
        this.addScriptByUrl(`https://login.reddah.com/uploadphoto/${this.guid}.js`);
        this.addCssByUrl(`https://login.reddah.com/uploadphoto/${this.guid}.css`);
        
    }

    addScriptByUrl(src){
        let key = this.guid+"_js";
        /*let item = this._document.getElementById(key);
        if(item){
            this._document.body.removeChild(item);
        }*/

        let s = this._renderer2.createElement('script');
        s.type = "text/javascript";
        s.src = src;
        s.id = key;
        
        this._renderer2.appendChild(
            this._document.body.getElementsByTagName("app-mini-viewer")[0], s);
        
    }

    addCssByUrl(href){
        let key = this.guid+"_css";
        /*let item = this._document.getElementById(key);
        if(item){
            this._document.body.removeChild(item);
        }*/
        
        let s = this._renderer2.createElement('link');
        s.type = "text/css";
        s.href = href;
        s.rel = "stylesheet";
        s.id = key;
        this._renderer2.appendChild(
            this._document.body.getElementsByTagName("app-mini-viewer")[0], s);
    }

    ionViewWillLeave(){
        /*let key1 = this.guid+"_js";
        let item1 = this._document.getElementById(key1);
        if(item1){
            this._document.body.removeChild(item1);
        }

        let key2 = this.guid+"_css";
        let item2 = this._document.getElementById(key2);
        if(item2){
            this._document.body.removeChild(item2);
        }*/
    }

    /*
    addScriptByText(text){
        let s = this._renderer2.createElement('script');
        s.type = "text/javascript";
        s.text = text;
        

        this._renderer2.appendChild(this._document.body, s);
    }*/

    
    

    close() {
        this.modalController.dismiss();
    }

  
}
