import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { LocalePage } from '../locale/locale.page';
import { MusicService } from '../music.service';
import { PlayPage } from '../play/play.page';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {

  songs=[];

  constructor(
    private router: Router,
    public reddah: ReddahService,
    private music: MusicService,
    private modalController: ModalController,
  ) {}
  
  ngOnInit() {
    this.songs = this.music.songs;
  }

  ionViewDidEnter(){

  }

  async chooseSong(song){
    this.modalController.dismiss(song)
  }

  async locale(){
      let currentLocale = this.reddah.getCurrentLocale();
      const changeLocaleModal = await this.modalController.create({
          component: LocalePage,
          componentProps: { orgLocale: currentLocale },
          cssClass: "modal-fullscreen",
          swipeToClose: true,
          presentingElement: await this.modalController.getTop(),
      });
      
      await changeLocaleModal.present();
      const { data } = await changeLocaleModal.onDidDismiss();
      if(data){
          let currentLocale = this.reddah.getCurrentLocale();
          this.reddah.loadTranslate(currentLocale);
      }    
  }


}
