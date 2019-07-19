import { Component, OnInit, Input, SecurityContext, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

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
        private sanitizer: DomSanitizer,
        private webView: WebView,
        private iab: InAppBrowser,

    ) {
    }

    ngOnInit() {
        let text = this.reddah.htmlDecode(this.content);
        
        this.html = this.sanitizer.bypassSecurityTrustHtml(text);
        this.reddah.openMini("https://login.reddah.com/uploadphoto/mini1.html", "mini1.html");
        //const browser = this.iab.create(this.html);
        //browser.show();
        
    }

    
    

    close() {
        this.modalController.dismiss();
    }

  
}
