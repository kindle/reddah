import { Component, OnInit, Input, ViewEncapsulation, ViewChild, NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { ModalController, IonContent, Platform, LoadingController, AlertController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Gyroscope, GyroscopeOptions } from '@ionic-native/gyroscope/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { RankPage } from '../common/rank/rank.page';

import { ImageViewerComponent } from '../common/image-viewer/image-viewer.component';
import { TopicPage } from 'src/app/topic/topic.page';
import { Plugins, CameraSource, CameraResultType } from '@capacitor/core';

const { Browser, Camera, Filesystem, Haptics, Device, Storage } = Plugins;

@Component({
    selector: 'app-start',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss'],
})
export class StartComponent implements OnInit{

    constructor(
      private _renderer2: Renderer2,
      @Inject(DOCUMENT) private _document: Document,
      ) {}
  
      ngOnInit(){
        this.addScriptByUrl(`/assets/js/jquery.js`);
        this.addScriptByUrl("/assets/start/zepto.1.1.4.min.js");
        this.addScriptByUrl("/assets/start/jsapi_share.js");
        this.addScriptByUrl("/assets/start/head.min.js");
      }
  
  
      ionViewDidEnter(){
        this.addScriptByUrl("/assets/start/start.js");
      }
  
      addScriptByUrl(src){
        let key = this.nonce_str()+"_js";
    
        let s = this._renderer2.createElement('script');
        s.type = "text/javascript";
        s.src = src;
        s.id = key;
        
        this._renderer2.appendChild(
            this._document.body.getElementsByTagName("app-start")[0], s);
        
      }
  
      nonce_str() {
          return 'xxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random() * 10 | 0, v = r;
              return v.toString(10);
          });
      }
  
  }
  