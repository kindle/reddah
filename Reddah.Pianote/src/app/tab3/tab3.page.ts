import { Component, OnInit, Input } from '@angular/core';
import {fabric} from 'fabric'
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  constructor(
    private reddah : ReddahService,
    ) {}

  canvasBox = [];

  ngOnInit() {
    for(let i=0;i<8;i++){
        this.canvasBox.push({id:"c"+i, canvas: null, note: -100, sound: [], json: null});
    }
  }

  halfLineHeight = 7;
  topMargin = 60;

  ionViewDidEnter(){
    this.init();
  }

  init(){

    this.currentIndex = 0;
    this.pai = 4;

    for(let i = 0;i<this.canvasBox.length;i++)
    {
      this.canvasBox[i].canvas = new fabric.Canvas(this.canvasBox[i].id);
      this.canvasBox[i].canvas.setWidth(200);
      this.canvasBox[i].canvas.setHeight(240);

      for(let j=1;j<=5;j++){
        let line = new fabric.Rect({ left: 0, top: this.halfLineHeight*2*j+this.topMargin, fill: '#000', width: 200, height: 1 });
        line.id=j;
        line.selectable = false;
        this.canvasBox[i].canvas.add(line);
      }

      for(let j=6;j<=8;j++){
        let line = new fabric.Rect({ left: 0, top: this.halfLineHeight*2*j+this.topMargin, fill: 'transparent', width: 200, height: 1 });
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

      //this.canvasBox[i].json = this.canvasBox[i].canvas.toJSON();
    }
  }

  clear(){
    for(let i = 0;i<this.canvasBox.length;i++){
      let objects = this.canvasBox[i].canvas.getObjects();
      for(let j = 0; j < objects.length; j++){
        //remove all but lines
        if(objects[j].id==null)    
          this.canvasBox[i].canvas.remove(objects[j]);
      }
      this.canvasBox[i].note = -100;
      this.canvasBox[i].sound = [];
    }
    this.currentIndex = 0;
    this.pai = 4;
    
    if(this.isPlay)
      this.stop();
  }

  currentIndex = 0;
  pai = 4;
  addNote(n){
    let color=n==1?"#000":"#0f0";
    

    let canvasIndex = parseInt(this.currentIndex/this.pai+"");
    this.canvasBox[canvasIndex].sound.push(9);

    if(n==0){
      let group0 = new fabric.Group([this.reddah.quarterRest()],{
        left: 15+(this.currentIndex%this.pai)*50,
        top: this.halfLineHeight*3 + this.topMargin,
        scaleY: 1.5,
        scaleX: 1.2
      })
      group0.lockMovementX = true;
      group0.lockMovementY = true;
      group0.lockRotation = true;
      group0.hasBorders = false;
      group0.hasControls = false;
      group0.noteKey = -100;
      group0.isWholeNote = true;
      group0.noteIndex = parseInt(this.currentIndex%this.pai+"");
      this.canvasBox[canvasIndex].sound[group0.noteIndex] = -100;
      this.canvasBox[canvasIndex].canvas.add(group0);
    }
    else if(n==1){
      let group1 = new fabric.Group([this.reddah.hollowHead(),this.reddah.stem0()],{
        left: 15+(this.currentIndex%this.pai)*50,
        top: this.halfLineHeight*4 + this.topMargin,
      })
      group1.lockMovementX = true;
      group1.lockRotation = true;
      group1.hasBorders = false;
      group1.hasControls = false;
      group1.noteKey = 3;
      group1.isWholeNote = true;
      group1.noteIndex = parseInt(this.currentIndex%this.pai+"");
      this.canvasBox[canvasIndex].sound[group1.noteIndex] = 3;
      this.canvasBox[canvasIndex].canvas.add(group1);
    }
    else if(n==2){
      let group2 = new fabric.Group([this.reddah.hollowHead(),this.reddah.stem()],{
        left: 15+(this.currentIndex%this.pai)*50,
        top: this.halfLineHeight*4 + this.topMargin,
      })
      group2.lockMovementX = true;
      group2.lockRotation = true;
      group2.hasBorders = false;
      group2.hasControls = false;
      group2.noteKey = 3;
      group2.noteIndex = parseInt(this.currentIndex%this.pai+"");
      this.canvasBox[canvasIndex].sound[group2.noteIndex] = 3;
      this.canvasBox[canvasIndex].canvas.add(group2);
    }
    else if(n==4){
      let group4 = new fabric.Group([this.reddah.solidHead(),this.reddah.stem()],{
        left: 15+(this.currentIndex%this.pai)*50,
        top: this.halfLineHeight*4 + this.topMargin,
      })
      group4.lockMovementX = true;
      group4.lockRotation = true;
      group4.hasBorders = false;
      group4.hasControls = false;
      group4.noteKey = 3;
      group4.noteIndex = parseInt(this.currentIndex%this.pai+"");
      this.canvasBox[canvasIndex].sound[group4.noteIndex] = 3;
      this.canvasBox[canvasIndex].canvas.add(group4);
    }
    else if(n==8){
      let group8 = new fabric.Group([this.reddah.solidHead(),this.reddah.stem(),this.reddah.tail()],{
        left: 15+(this.currentIndex%this.pai)*50,
        top: this.halfLineHeight*4 + this.topMargin,
      })
      group8.lockMovementX = true;
      group8.lockRotation = true;
      group8.hasBorders = false;
      group8.hasControls = false;
      group8.noteKey = 3;
      group8.noteIndex = parseInt(this.currentIndex%this.pai+"");
      this.canvasBox[canvasIndex].sound[group8.noteIndex] = 3;
      this.canvasBox[canvasIndex].canvas.add(group8);
    }
    else if(n==16)
    {
      let group16 = new fabric.Group([this.reddah.solidHead(),this.reddah.stem(),this.reddah.twoTails()],{
        left: 15+(this.currentIndex%this.pai)*50,
        top: this.halfLineHeight*4 + this.topMargin,
      })
      group16.lockMovementX = true;
      group16.lockRotation = true;
      group16.hasBorders = false;
      group16.hasControls = false;
      group16.noteKey = 3;
      group16.noteIndex = parseInt(this.currentIndex%this.pai+"");
      this.canvasBox[canvasIndex].sound[group16.noteIndex] = 3;
      this.canvasBox[canvasIndex].canvas.add(group16);
    }





    this.currentIndex++;



  }

  getHead(target){
      return new fabric.Rect({ 
          left: target.left, 
          //top: target.top + target.isWholeNote==null ? this.halfLineHeight*5 : this.halfLineHeight, 
          top: target.top + this.halfLineHeight*5,
          width: target.width, 
          height: this.halfLineHeight*2
      });
  }

  onChange(e, i) {
      e.target.setCoords();
      this.canvasBox[i].canvas.forEachObject((obj)=> {     
        if (obj === e.target) return;

        if(this.getHead(e.target).intersectsWithObject(obj)){
          obj.set('opacity' , 0.5);
        }
        else{ 
          obj.set('opacity' , 1);
        }
        
      });
  }

  animate(e, dir, i) {
      if (e.target) {
        if(e.target.type!="group") return;
        if(dir==0){//mouseup
          e.target.setCoords();
          
          let a=0,b=0;
          this.canvasBox[i].canvas.forEachObject((obj)=> {
            if (obj === e.target) return;
            if(this.getHead(e.target).intersectsWithObject(obj)){
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
            e.target.top = this.halfLineHeight*2+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="1_2"){
            e.target.noteKey = 10;
            this.canvasBox[i].sound[e.target.noteIndex] = 10;
            e.target.top = this.halfLineHeight*3+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="2_0"){
            e.target.noteKey = 9;
            this.canvasBox[i].sound[e.target.noteIndex] = 9;
            e.target.top = this.halfLineHeight*4+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="2_3"){
            e.target.noteKey = 8;
            this.canvasBox[i].sound[e.target.noteIndex] = 8;
            e.target.top = this.halfLineHeight*5+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="3_0"){
            e.target.noteKey = 7;
            this.canvasBox[i].sound[e.target.noteIndex] = 7;
            e.target.top = this.halfLineHeight*6+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="3_4"){
            e.target.noteKey = 6;
            this.canvasBox[i].sound[e.target.noteIndex] = 6;
            e.target.top = this.halfLineHeight*7+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="4_0"){
            e.target.noteKey = 5;
            this.canvasBox[i].sound[e.target.noteIndex] = 5;
            e.target.top = this.halfLineHeight*8+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="4_5"){
            e.target.noteKey = 4;
            this.canvasBox[i].sound[e.target.noteIndex] = 4;
            e.target.top = this.halfLineHeight*9+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="5_0"){
            e.target.noteKey = 3;
            this.canvasBox[i].sound[e.target.noteIndex] = 3;
            e.target.top = this.halfLineHeight*10+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="5_6"){
            e.target.noteKey = 2;
            this.canvasBox[i].sound[e.target.noteIndex] = 2;
            e.target.top = this.halfLineHeight*11+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="6_0"){
            e.target.noteKey = 1;
            this.canvasBox[i].sound[e.target.noteIndex] = 1;
            e.target.top = this.halfLineHeight*12+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="6_7"){
            e.target.noteKey = -7;
            this.canvasBox[i].sound[e.target.noteIndex] = -7;
            e.target.top = this.halfLineHeight*13+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="7_0"){
            e.target.noteKey = -6;
            this.canvasBox[i].sound[e.target.noteIndex] = -6;
            e.target.top = this.halfLineHeight*14+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="7_8"){
            e.target.noteKey = -5;
            this.canvasBox[i].sound[e.target.noteIndex] = -5;
            e.target.top = this.halfLineHeight*15+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="8_0"){
            e.target.noteKey = -4;
            this.canvasBox[i].sound[e.target.noteIndex] = -4;
            e.target.top = this.halfLineHeight*16+this.topMargin - this.halfLineHeight*6;
          }
          

        }

        /*fabric.util.animate({
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
        });*/
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

    stop(){
      this.i=0;
      this.isPlay = false;
      window.clearTimeout(this.time);
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
        return this.reddah.f.get(value);
    }


    sharp(){
      console.log(this.canvasBox[0].canvas)
    }

    flat(){

    }

}
