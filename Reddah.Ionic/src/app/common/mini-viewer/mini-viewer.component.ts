import { Component, OnInit, Input, SecurityContext, ViewEncapsulation, ViewChild, NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { ModalController, Content, Platform } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { RankPage } from '../rank/rank.page';
import { TranslateService } from '@ngx-translate/core';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';

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
    @Input() version;// id as versions

    html;

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        public sanitizer: DomSanitizer,
        private translate: TranslateService,
        private iab: InAppBrowser,
        private _renderer2: Renderer2, 
        private gyroscope: Gyroscope,
        private platform: Platform,
        private vibration: Vibration,
        private zone: NgZone,
        @Inject(DOCUMENT) private _document: Document
    ) {
    }

    close() {
        this.modalController.dismiss();
    }

    addScriptByUrl(src){
        let key = this.guid+"_js";

        let s = this._renderer2.createElement('script');
        s.type = "text/javascript";
        s.src = src;
        s.id = key;
        
        this._renderer2.appendChild(
            this._document.body.getElementsByTagName("app-mini-viewer")[0], s);
        
    }

    addCssByUrl(href){
        let key = this.guid+"_css";
        
        let s = this._renderer2.createElement('link');
        s.type = "text/css";
        s.href = href;
        s.rel = "stylesheet";
        s.id = key;
        this._renderer2.appendChild(
            this._document.body.getElementsByTagName("app-mini-viewer")[0], s);
    }

    ngOnInit() {
        let text = this.reddah.htmlDecode(this.content);
        
        this.html = this.sanitizer.bypassSecurityTrustHtml(text);
        
        this.addScriptByUrl(`https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js`);
        this.addScriptByUrl("https://wow.techbrood.com/libs/zepto.1.1.4.min.js");
        this.addScriptByUrl("https://wow.techbrood.com/uploads/150101/jsapi_share.js");
        this.addScriptByUrl("https://wow.techbrood.com/uploads/150101/head.min.js");
        this.addScriptByUrl(`https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.3.4/bluebird.min.js`);
        //this.addScriptByUrl(`https://secure.aadcdn.microsoftonline-p.com/lib/1.0.0/js/msal.js`);
        //this.addScriptByUrl(`https://cdnjs.cloudflare.com/ajax/libs/p2.js/0.6.0/p2.min.js`);

        //non-native api
        this.initApi();

        if(this.platform.is('cordova')){
            this.initNativeApi();
        }
    }

    bodyClick(){

    }
    
    loaded = false;

    ionViewDidEnter(){
        this.addScriptByUrl(`https://login.reddah.com/uploadphoto/${this.guid}.js?version=${this.version}`);
        this.addCssByUrl(`https://login.reddah.com/uploadphoto/${this.guid}.css?version=${this.version}`);
    }
    
    initApi(){
        window["reddahApi"] = {};
        window["reddahApi"].UserName = this.reddah.getCurrentUser();
        window["reddahApi"].Locale = this.reddah.getCurrentLocale();
        window["reddahApi"].Jwt = this.reddah.getCurrentJwt();
        window["reddahApi"].loadCompleted = ()=> { 
            this.zone.run(()=>{
                this.loaded = true;
            })
        }
        window["reddahApi"].uploadScore = (n: Number, sub="")=> {
            let appId = this.guid;
            let appSub = sub;
            let score = n;
            let data = new FormData();
            data.append("appId", appId);
            data.append("appSub", appSub);
            data.append("Score", JSON.stringify(score));
            this.reddah.uploadGameScore(data).subscribe(data=>{
                alert(JSON.stringify(data));
            });
        }
        //decoration:1-22
        //base64image less than 500k
        window["reddahApi"].qqMusk = (decoration, base64Image)=>{
            let app_id = this.reddah.qq_app_id;
            let app_key = this.reddah.qq_app_key;
            let time_stamp = new Date().getTime();
            let nonce_str = this.reddah.nonce_str();
            
            let params = {
                "app_id":app_id,
                "time_stamp":Math.floor(time_stamp/1000),
                "nonce_str":nonce_str,
                "decoration":decoration,
                "image":base64Image,
                "sign":"",
                "app_key":""
            }
            params["sign"] = this.reddah.getReqSign(params, app_key);
            //console.log(params)

            return this.reddah.getQqMusk(params, app_key);
        }

        window["reddahApi"].viewImage = (base64ImageData)=>{
            this.viewer(base64ImageData);
        }

    }

    async viewer(data) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
                index:0,
                imgSourceArray: this.reddah.preImageArray([data]),
                imgTitle: "",
                imgDescription: ""
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true
        });
    
        return await modal.present();
    }


    initNativeApi(){
        
        //share to timeline
        //share to friends
        //send to leaderboard
        //get leaderboard
        
        this.initGyro();
        this.initVibration();
        this.initCameraPhoto();
        this.initLibPhoto();
    }

    initGyro(){
        let options: GyroscopeOptions = {
            frequency: 20
        };
        
        window["reddahApi"].watchGyro = ()=> { 
            return this.gyroscope.watch(options);
        }
    }

    initVibration(){
        window["reddahApi"].vibrate = ()=> {
            this.vibration.vibrate(1000);
        }
    }

    initCameraPhoto(){
        window["reddahApi"].camera = ()=>{
            const options: CameraOptions = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
                correctOrientation: true
            }
                
            return Camera.getPicture(options);
        }
    }

    initLibPhoto(){
        window["reddahApi"].album = ()=>{
            const options: CameraOptions = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                correctOrientation: true
            }
                
            return Camera.getPicture(options);
        }
    }

    share(){
        this.modalController.dismiss('share');
    }

    async rank(){
        const modal = await this.modalController.create({
            component: RankPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
    
        await modal.present();
    }

    async report(){
        this.modalController.dismiss('report');
    }
}
