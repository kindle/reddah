import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { LocalePage } from '../locale/locale.page';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  constructor(
    private router: Router,
    private alertController: AlertController,
    private modalController: ModalController,
    public reddah: ReddahService,
  ) {}

  ngOnInit() {
      
  }

  reorderDisabled = true;
  toggleReorder() {
        this.reorderDisabled = !this.reorderDisabled;
  }

  reorder(ev){
    try {
        if (ev.detail.to === this.reddah.records.length) {
            ev.detail.to -= 1;
        }
        if (ev.detail.from < ev.detail.to) {
            this.reddah.records.splice(ev.detail.to + 1, 0, this.reddah.records[ev.detail.from]);
            this.reddah.records.splice(ev.detail.from, 1);
        }
        if (ev.detail.from > ev.detail.to) {
            this.reddah.records.splice(ev.detail.to, 0, this.reddah.records[ev.detail.from]);
            this.reddah.records.splice(ev.detail.from + 1, 1);
        }
        
        ev.detail.complete(true);
    } catch (e) {

        ev.detail.complete(true);
        return;
    }

    this.reddah.setRecords();

    console.log(this.reddah.records)
  }


  async deleteConfirm(record) {
      const alert = await this.alertController.create({
          header: this.reddah.instant("ConfirmTitle"),
          message: this.reddah.instant("ConfirmDeleteMessage"),
          buttons: [
            {
                text: this.reddah.instant("ConfirmCancel"),
                role: 'cancel',
                cssClass: 'secondary',
                handler: (blah) => {
                }
            }, 
            {
                text: this.reddah.instant("ConfirmYes"),
                handler: () => {
                  for (var i = 0; i < this.reddah.records.length; i++) { 
                      if (this.reddah.records[i].create == record.create) {
                          if(record.create==this.create&&this.isPlay){
                              this.btnStop();
                          }
                          this.reddah.records.splice(i, 1); 
                          this.reddah.setRecords();
                          break;
                      } 
                  }
                }
            }
          ]
      });

      await alert.present().then(()=>{});
  }









    chooseToPlay(record){
        this.btnStop();

        this.name = record.name;
        this.speed = record.speed;
        this.beat = record.beat;
        this.note = record.note;
        this.create = record.create;
        this.i = -1;
        this.reload(this.beat);

        this.btnPlay();
    }

    chooseToStop(){
        this.btnStop();
    }

    name = "New Record";
    speed = 100;
    create = 0;
    clickTime = 0;
    s = Date.now();
    time = 0;
    isPlay = false;

    play = () => {
        window.clearTimeout(this.time);
        this.playsound();
        if (this.isPlay) {
            this.time = window.setTimeout(this.play, Math.floor(60000 / this.speed));
        };
    }

    audioCtx = new AudioContext();
    i=-1;
    box = [];
    beat = 3;
    note = 4;
    reload(n){
        this.box = [];
        for(let i=1;i<=n;i++){
            this.box.push(1);
        }
    }

    playsound = () => {
        this.i++;
        
        let oscillator = this.audioCtx.createOscillator();
        let gainNode = this.audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        //oscillator.type = 'sine';//其他可选'sine','square','sawtooth','triangle'和'custom'
        /*if(this.i%this.box.length==0){
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(2220, this.audioCtx.currentTime);
        }
        else{ 
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(1220, this.audioCtx.currentTime);
        }*/
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1220, this.audioCtx.currentTime);
        //oscillator.frequency.linearRampToValueAtTime(50, this.audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.5);

        oscillator.start(this.audioCtx.currentTime);
        oscillator.stop(this.audioCtx.currentTime + 0.5);
    }


    ionViewDidLeave(){  
        if(this.isPlay){
            this.btnStop();
        }
    }

    btnPlay(){
        if(this.isPlay){
            window.clearTimeout(this.time);
            this.isPlay = false;
        }
        else{
            this.isPlay = true;
            this.play();
        }
    }

    btnStop(){
        window.clearTimeout(this.time);
        this.isPlay = false;

        this.create = 0;
        this.i = -1;
    }

    goToDetails(record){
        if(this.isPlay){
            this.btnStop();
        }
        this.router.navigate(['/tabs/tab2'], {
            queryParams: {
                record: JSON.stringify(record)
            }
        });
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
