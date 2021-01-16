import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocalePage } from '../locale/locale.page';
import { MusicService } from '../music.service';
import { PlayPage } from '../play/play.page';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  songs=[];

  constructor(
    public reddah: ReddahService,
    private music: MusicService,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    private modalController: ModalController,
  ) {}
  
  ngOnInit() {
    this.songs = this.music.songs;
  }

  ionViewDidEnter(){

  }

  async playSong(song){
    const modal = await this.modalController.create({
        component: PlayPage,
        componentProps: { song: song.json },
        cssClass: "modal-fullscreen",
        swipeToClose: true,
        presentingElement: await this.modalController.getTop(),
    });
    
    await modal.present();
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
