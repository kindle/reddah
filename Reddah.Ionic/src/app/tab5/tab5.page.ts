import { Component, Renderer2, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ReddahService } from '../reddah.service';
import { ModalController } from '@ionic/angular';
import { MapPage } from '../map/map.page';
import { EarthPage } from '../tabs/earth/earth.page';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss']
})
export class Tab5Page implements OnInit{

    constructor(
        private _renderer2: Renderer2,
        @Inject(DOCUMENT) private _document: Document,
        public reddah: ReddahService,
        private modalController: ModalController,
    ) {}

    ngOnInit(){
        this.addScriptByUrl("/assets/starsky/index.js");
          
      }
    
      addScriptByUrl(src){
        let key = this.reddah.nonce_str()+"_js";
    
        let s = this._renderer2.createElement('script');
        s.type = "text/javascript";
        s.src = src;
        s.id = key;
        
        this._renderer2.appendChild(
            this._document.body.getElementsByTagName("app-tab5")[0], s);
        
      }
    
        async openEarth(){
            let yearslater = false;
            if(yearslater){
                const modal = await this.modalController.create({
                    component: EarthPage,
                    componentProps: {},
                    cssClass: "modal-fullscreen",
                });
                
                await modal.present();
            }
            else{
                const modal = await this.modalController.create({
                    component: MapPage,
                    componentProps: {
                    },
                    cssClass: "modal-fullscreen",
                });
                  
                await modal.present();
            }
        }



}
