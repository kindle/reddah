import { Component, OnInit, Input, SecurityContext, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';


@Component({
    selector: 'app-mini-viewer',
    templateUrl: './mini-viewer.component.html',
    styleUrls: ['./mini-viewer.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class MiniViewerComponent implements OnInit {
    @Input() content;

    html;

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        public sanitizer: DomSanitizer,
        private webView: WebView,
        private iab: InAppBrowser,
        private _renderer2: Renderer2, 
        @Inject(DOCUMENT) private _document: Document
    ) {
    }

    ngOnInit() {
        let text = this.reddah.htmlDecode(this.content);
        
        this.html = this.sanitizer.bypassSecurityTrustHtml(text);
        //this.reddah.openMini("https://login.reddah.com/uploadphoto/mini1.html", "mini1.html");
        //const browser = this.iab.create("https://login.reddah.com/uploadphoto/mini1.html","location=no");
        //browser.show();

        this.addScript(`https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js`);
        this.addScript("https://wow.techbrood.com/libs/zepto.1.1.4.min.js");
        this.addScript("https://wow.techbrood.com/uploads/150101/jsapi_share.js");
        this.addScript("https://wow.techbrood.com/uploads/150101/head.min.js");
        this.addScript(`https://reddah.com/test4.js`);
    }

    addScript(src){
        let s = this._renderer2.createElement('script');
        s.type = "text/javascript";
        s.src = src;

        this._renderer2.appendChild(this._document.body, s);
    }

    
    

    close() {
        this.modalController.dismiss();
    }

  
}
