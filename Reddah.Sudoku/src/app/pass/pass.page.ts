import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-webstorage';
import { ReddahService } from '../reddah.service';

@Component({
    selector: 'app-pass',
    templateUrl: './pass.page.html',
    styleUrls: ['./pass.page.scss'],
})
export class PassPage implements OnInit {

    constructor(
        private _renderer2: Renderer2,
        @Inject(DOCUMENT) private _document: Document,
        public reddah: ReddahService,
        ) {
    }

    ngOnInit(){
        this.addScriptByUrl("/assets/js/pass.js");
    }

    ionViewDidEnter(){
    }

    addScriptByUrl(src){
        let key = this.reddah.nonce_str()+"_js";

        let s = this._renderer2.createElement('script');
        s.type = "text/javascript";
        s.src = src;
        s.id = key;
        
        this._renderer2.appendChild(
        this._document.body.getElementsByTagName("app-pass")[0], s);
    
    }
    

}
