import { Component, Inject, Renderer2, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { EarthPage } from '../tabs/earth/earth.page';
import { MapPage } from '../map/map.page';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{

  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    private modalController: ModalController,
    public reddah: ReddahService,
    ) {}

  ngOnInit(){
    
  }

}
