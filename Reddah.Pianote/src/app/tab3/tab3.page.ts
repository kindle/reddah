import { Component, OnInit, Input } from '@angular/core';
import {fabric} from 'fabric'

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  canvasBox = [];

  ngOnInit() {
    for(let i=0;i<8;i++){
        this.canvasBox.push({id:"c"+i, canvas: null, note: -100, sound: []});
    }
  }

  ionViewDidEnter(){
    for(let i = 0;i<this.canvasBox.length;i++){
        this.canvasBox[i].canvas = new fabric.Canvas(this.canvasBox[i].id);
        this.canvasBox[i].canvas.setWidth(200);
        this.canvasBox[i].canvas.setHeight(240);

        for(let j=1;j<=5;j++){
          let line = new fabric.Rect({ left: 0, top: 20*j+60, fill: '#000', width: 200, height: 1 });
          line.id=j;
          line.selectable = false;
          this.canvasBox[i].canvas.add(line);
        }
    
        this.canvasBox[i].canvas.forEachObject((o)=>{ o.hasBorders = o.hasControls = false; });
    
        this.canvasBox[i].canvas.hoverCursor = 'pointer';
        this.canvasBox[i].canvas.on({
          'object:moving': (e)=>this.onChange(e, i),
          'object:scaling': (e)=>this.onChange(e, i),
          'object:rotating': (e)=>this.onChange(e, i),
          'mouse:down': (e)=> this.animate(e, 1, i),
          'mouse:up': (e)=> this.animate(e, 0, i)
        });
    }
    
  }

  currentIndex = 0;
  pai = 4;
  addNote(n){
    let color=n==1?"#000":"#0f0";

    var src ="http://dev9.edisbest.com/Bat_B_020.svg"; 
    let svg = new fabric.loadSVGFromURL(src,(objects,options)=>{
      let shape = fabric.util.groupSVGElements(objects,options); 
      shape.set({
      left:15+(this.currentIndex%this.pai)*50,
      top:100,
      scaleY:1,
      scaleX:1
      }); 
    });
   


    let note = new fabric.Circle({ left: 15+(this.currentIndex%this.pai)*50, top: 100, fill: color, radius:10 });
    note.lockMovementX = true;
    note.lockRotation = true;
    note.hasBorders = false;
    note.hasControls = false;
    note.noteKey = 9;
    note.noteIndex = parseInt(this.currentIndex%this.pai+"");
    let canvasIndex = parseInt(this.currentIndex/this.pai+"");
    this.canvasBox[canvasIndex].canvas.add(note);
    this.canvasBox[canvasIndex].sound.push(9);
    this.currentIndex++;
  }

  onChange(e, i) {
      e.target.setCoords();
      this.canvasBox[i].canvas.forEachObject((obj)=> {
        if (obj === e.target) return;
        if(e.target.intersectsWithObject(obj)){
          obj.set('opacity' , 0.5);
        }
        else{ 
          obj.set('opacity' , 1);
        }
        
      });
  }

  animate(e, dir, i) {
      if (e.target) {
        if(dir==0){//mouseup
          e.target.setCoords();
          
          let a=0,b=0;
          this.canvasBox[i].canvas.forEachObject((obj)=> {
            if (obj === e.target) return;
            if(e.target.intersectsWithObject(obj)){
              if(a==0){
                a = obj.id;
              }
              else{
                b = obj.id;
              }
            }
          });
            console.log(a+"_"+b)
          if(a+"_"+b=="1_0"){
            e.target.noteKey = 11;
            this.canvasBox[i].sound[e.target.noteIndex] = 11;
            e.target.top = 80;
          }else if(a+"_"+b=="1_2"){
            e.target.noteKey = 10;
            this.canvasBox[i].sound[e.target.noteIndex] = 10;
            e.target.top = 90;
          }else if(a+"_"+b=="2_0"){
            e.target.noteKey = 9;
            this.canvasBox[i].sound[e.target.noteIndex] = 9;
            e.target.top = 100;
          }else if(a+"_"+b=="2_3"){
            e.target.noteKey = 8;
            this.canvasBox[i].sound[e.target.noteIndex] = 8;
            e.target.top = 110;
          }else if(a+"_"+b=="3_0"){
            e.target.noteKey = 7;
            this.canvasBox[i].sound[e.target.noteIndex] = 7;
            e.target.top = 120;
          }else if(a+"_"+b=="3_4"){
            e.target.noteKey = 6;
            this.canvasBox[i].sound[e.target.noteIndex] = 6;
            e.target.top = 130;
          }else if(a+"_"+b=="4_0"){
            e.target.noteKey = 5;
            this.canvasBox[i].sound[e.target.noteIndex] = 5;
            e.target.top = 140;
          }else if(a+"_"+b=="4_5"){
            e.target.noteKey = 4;
            this.canvasBox[i].sound[e.target.noteIndex] = 4;
            e.target.top = 150;
          }else if(a+"_"+b=="5_0"){
            e.target.noteKey = 3;
            this.canvasBox[i].sound[e.target.noteIndex] = 3;
            e.target.top = 160;
          }

        }

        fabric.util.animate({
          startValue: e.target.get('angle'),
          endValue: e.target.get('angle') + (dir ? 10 : -10),
          duration: 100,
          onChange: (value)=> {
            e.target._setOriginToCenter();
            this.canvasBox[i].canvas.renderAll();
          },
          onComplete:()=> {
            e.target.setCoords();
          }
        });
        fabric.util.animate({
          startValue: e.target.get('scaleX'),
          endValue: e.target.get('scaleX') + (dir ? 0.2 : -0.2),
          duration: 100,
          onChange: (value)=> {
            e.target.scale(value);
            this.canvasBox[i].canvas.renderAll();
          },
          onComplete: ()=> {
            e.target.setCoords();
          }
        });
      }
    }

    i = 0;
    time;
    isPlay = false;
    speed = 80;
    play=()=>{
        this.isPlay = true;
        window.clearTimeout(this.time);
        this.playKey();
        if (this.isPlay) {
            this.time = window.setTimeout(this.play, Math.floor(60000 / this.speed));
        };
    }

    audioCtx = new AudioContext();
    playKey(){
        let oscillator = this.audioCtx.createOscillator();
        let gainNode = this.audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        oscillator.type = 'sine';

        let canvasIndex = parseInt(this.i/this.pai+"");
        let noteIndex = parseInt(this.i%this.pai+"");
        oscillator.frequency.value = 
          this.getFrequency(canvasIndex, noteIndex);
        gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + 0.01);
        
        oscillator.start(this.audioCtx.currentTime);
        oscillator.stop(this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1);
        oscillator.stop(this.audioCtx.currentTime + 1);
        
        if(this.i!=this.canvasBox.length-1)
          this.i++;
        else
          this.i = 0;
    }

    f = new Map()
    .set(3,329.63)
    .set(4,349.23)
    .set(5,392.00)  
    .set(6,440.00)
    .set(7,493.88)
    .set(8,523.25)
    .set(9,587.33)
    .set(10,659.25)
    .set(11,698.46)

    getFrequency(cIndex, nIndex){
        if((cIndex>this.canvasBox.length-1)||cIndex<0)
          return 0;
        if((nIndex>this.canvasBox[cIndex].sound.length-1)||nIndex<0)
          return 0;

        let value = this.canvasBox[cIndex].sound[nIndex];
        if(value==-100){
          this.i=-1;
          return 0;
        }
        return this.f.get(value);
    }

}
