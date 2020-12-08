import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as $ from 'jquery';
import 'jquery-knob';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit  {

    constructor(
        private router: Router,
        public reddah: ReddahService,
        private activeRouter: ActivatedRoute,
    ) {}

    ngOnInit(): void {
      $(".dial").knob({
          max: 300,
          min: 20,
          thickness: .3,
          fgColor: '#3880ff',
          bgColor: '#d7d8da',
          'release':(e)=>{
              this.btnChange(e);
          }
      });
      this.reloadBox();
    }

    name = "";
    speed = 100;
    create;
    beat = 3;
    note = 4;



    clickTime = 0;
    s = Date.now();
    time = 0;
    isPlay = false;


    isEdit = false;
    toggleEdit(){
        this.isEdit = !this.isEdit;
    }

    onBlur(){
        this.saveRecord();
        this.toggleEdit();
    }

    saveRecord(){
        this.reddah.records.forEach((r,index)=>{
            if(r.create==this.create){
                r.name = this.name;
                r.speed = this.speed;
                r.beat = this.beat;
                r.note = this.note;
            }
        });
        this.reddah.setRecords();
    }

    ionViewDidLeave(){  
        if(this.isPlay){
            this.btnStop();
        }

    }
    ionViewDidEnter(){  
        let currentRecord = this.activeRouter.snapshot.queryParams["record"];
        if(currentRecord==null){
            this.addRecord();
        }
        else{
            let record = JSON.parse(currentRecord);
            if(record){
                this.name = record.name;
                this.speed = record.speed;
                this.beat = record.beat;
                this.note = record.note;
                this.create = record.create;
                this.i = -1;
                this.reload();
            }
        }
        this.btnPlay();
    }

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

    reloadBox(){
       this.box = [];
       this.box.push(1);
       this.box.push(1);
       this.box.push(1);
       this.box.push(1);

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




    btnPlay(){
        if(this.isPlay){
            window.clearTimeout(this.time);
            this.isPlay = false;
        }
        else{
            this.isPlay = true;
            this.play();
        }
        //this.save();
        //this.style.display = "none";
        //document.getElementById("btnStop").style.display = "inline-block";
    }

    btnStop(){
        window.clearTimeout(this.time);
        this.isPlay = false;
        //this.style.display = "none";
        //document.getElementById("btnPlay").style.display = "inline-block";
    }


    btnSub(){
        this.speed--;
        this.saveRecord();
    }

    btnAdd(){
        this.speed++;
        this.saveRecord();
    }

    btnChange(value){
        this.speed = value * 1;
        this.saveRecord();
    }


    
    reload(){
        this.box = [];
        for(let i=1;i<=this.beat;i++){
            this.box.push(1);
        }
    }

    goBack(){
        this.btnStop();
    }

    addRecord(){
        let names = this.reddah.records.filter(x=>x.name.indexOf(this.reddah.instant("NewRecord"))>-1);
        let newName = this.reddah.instant("NewRecord");
        if(names!=null&&names.length>0){
            newName += names.length + 1;
        }

        this.name = newName;
        this.speed = 80;
        this.beat = 4;
        this.note = 4;
        this.create = Date.now();

        let record = {
            name: this.name,
            speed: this.speed,
            beat: this.beat,
            note: this.note,
            create: this.create,
        }
        
        this.reddah.records.unshift(record);
        this.reddah.setRecords();
    }

    subBeat(){
        this.beat --;
        if(this.beat<1)
            this.beat=1;
        this.reload();
        this.saveRecord();
    }

    addBeat(){
        this.beat ++;
        if(this.beat>16)
            this.beat=16;
        this.reload();
        this.saveRecord();
    }
}
