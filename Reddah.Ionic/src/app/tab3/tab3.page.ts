import { Component, Renderer2, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { MapPage } from '../map/map.page';
import { EarthPage } from '../tabs/earth/earth.page';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{

  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    private modalController: ModalController,
    public reddah: ReddahService,
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
        this._document.body.getElementsByTagName("app-tab3")[0], s);
    
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
