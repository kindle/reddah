import { Component, OnInit, Input } from '@angular/core';
import {fabric} from 'fabric'
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  keys88 = Array.from(this.reddah.f.keys());

  constructor(
    private reddah : ReddahService,
    ) {}


  canvasBox = [[],[]];

  beatsPerBar = 4;  //up
  beatNote = 4; //down

  currentClef = 0;

  ngOnInit() {
      for(let i=0;i<3;i++){
          //this.canvasBox[0].push({id:i, canvas: null, note: -100, sound: new Array(this.beatsPerBar), json: null});
          //this.canvasBox[1].push({id:i, canvas: null, note: -100, sound: new Array(this.beatsPerBar), json: null});
          this.canvasBox[0].push({id:i, canvas: null, beats: [], json: null});
          this.canvasBox[1].push({id:i, canvas: null, beats: [], json: null});
      }
  }

  halfLineHeight = 7;
  topMargin = 60;
  cursorInitLeft = 0;

  ionViewDidEnter(){
    this.addStartCanvas(true, this.beatsPerBar, this.beatNote);
    this.addStartCanvas(false, this.beatsPerBar, this.beatNote);

    this.init(0);
    this.init(1);
  }

  init(clef){
    for(let i = 0;i<this.canvasBox[clef].length;i++)
    {
      if(this.canvasBox[clef][i].canvas==null){
        console.log("init:"+clef+"_"+i)
        this.canvasBox[clef][i].canvas = new fabric.Canvas((clef==0?"t":"b")+this.canvasBox[clef][i].id);
        this.canvasBox[clef][i].canvas.setWidth(200);
        this.canvasBox[clef][i].canvas.setHeight(240);

        for(let h=11;h<=14;h++){
          let line = new fabric.Rect({ left: 0, top: this.halfLineHeight*2*(11-h)+this.topMargin, fill: 'transparent', width: 200, height: 1 });
          line.id=h;
          line.tag='sub'
          line.selectable = false;
          this.canvasBox[clef][i].canvas.add(line);
        }

        for(let j=1;j<=5;j++){
          let line = new fabric.Rect({ left: 0, top: this.halfLineHeight*2*j+this.topMargin, fill: '#000', width: 200, height: 1 });
          line.id=j;
          line.tag='main'
          line.selectable = false;
          this.canvasBox[clef][i].canvas.add(line);
        }

        for(let j=6;j<=9;j++){
          let line = new fabric.Rect({ left: 0, top: this.halfLineHeight*2*j+this.topMargin, fill: 'transparent', width: 200, height: 1 });
          line.id=j;
          line.tag='sub'
          line.selectable = false;
          this.canvasBox[clef][i].canvas.add(line);
        }


        let rect = new fabric.Rect({
          width: 1,
          height: 300,
          left: this.cursorInitLeft,
          top: 0,
          stroke: 'transparent',
          strokeWidth: 1,
          fill: 'transparent',
          selectable: false
        });
        rect.tag = "cursor"
        this.canvasBox[clef][i].canvas.add(rect);
    
        this.canvasBox[clef][i].canvas.forEachObject((o)=>{ o.hasBorders = o.hasControls = false; });
    
        this.canvasBox[clef][i].canvas.hoverCursor = 'pointer';
        this.canvasBox[clef][i].canvas.on({
            'object:moving': (e)=>this.onChange(clef, e, i),
            'object:scaling': (e)=>this.onChange(clef, e, i),
            'object:rotating': (e)=>this.onChange(clef, e, i),
            'mouse:down': (e)=> this.animate(clef, e, 1, i),
            'mouse:up': (e)=> {this.animate(clef, e, 0, i)},
        });
        //this.canvasBox[i].json = this.canvasBox[i].canvas.toJSON();

      }
    }
  }

  cursorAnimations(i, beatIndex){
    this.cursorAnimation(0, i, beatIndex);
    this.cursorAnimation(1, i, beatIndex);
  }

  cursorAnimation(clef, i, beatIndex) {
      let canvas = this.canvasBox[clef][i].canvas;

      let objects = canvas.getObjects()
      for(let j = 0; j < objects.length; j++){
        if(objects[j].tag=="cursor"){
          if(beatIndex==0){
            objects[j].left = 20;
          }else{
            objects[j].left = objects[j].left+50;
          }
          objects[j].set('stroke' , '#aaf');
          objects[j].set('fill' , '#faa');
          
          this.canvasBox[clef][i].canvas.requestRenderAll();
          
          if(beatIndex==this.beatsPerBar-1){
            setTimeout(()=>{
              objects[j].left = this.cursorInitLeft;
              objects[j].set('stroke' , 'transparent');
              objects[j].set('fill' , 'transparent');
              this.canvasBox[clef][i].canvas.requestRenderAll();
            }, Math.floor(60000 / this.speed))
          }
          /*
          if(beatIndex==0){
            objects[j].left = 15+5;
            ///objects[j].set('stroke' , '#aaf');
            //objects[j].set('fill' , '#faa');
          }
          objects[j].animate('left', 
            objects[j].left+50, 
            {
              duration: Math.floor(60000 / this.speed),
              onChange: canvas.renderAll.bind(canvas),
              onComplete: ()=> {
                objects[j].left = 0;
                canvas.renderAll.bind(canvas);
              },
              easing: fabric.util.ease['easeIn']
          });*/
          
          break;
        }
      }
      
  };

  addBar() {
      let barId = this.canvasBox[0].length;
      this.canvasBox[0].push({id:barId, canvas: null, beats: [], json: null});
      this.canvasBox[1].push({id:barId, canvas: null, beats: [], json: null});
  
      setTimeout(() => {
        this.init(0);
        this.init(1);
      },1)
  }

  deleteLastNote(){
    //this.canvasBox[this.currentClef][canvasIndex].canvas
  }

  clear(){
    this.clearClef(0);
    this.clearClef(1);
  }

  clearClef(clef){
    for(let i = 0;i<this.canvasBox[clef].length;i++){
      let objects = this.canvasBox[clef][i].canvas.getObjects();
      for(let j = 0; j < objects.length; j++){
        //remove all but lines & cursors
        if(["main","sub","cursor"].indexOf(objects[j].tag)==-1)    
          this.canvasBox[clef][i].canvas.remove(objects[j]);
      }
    }

    this.currentIndex.set(clef, 0);
    
    if(this.isPlay)
      this.stop();

    this.clearLastTarget()
  }


  addStartCanvas(flag, n1, n2){
    let startCanvas = new fabric.Canvas(flag?"startT":"startB");
    startCanvas.setWidth(100);
    startCanvas.setHeight(240);

    startCanvas.on({
      'mouse:up': (e)=> this.currentClef = flag? 0:1
    });

    for(let j=1;j<=5;j++){
        let line = new fabric.Rect({ left: 0, top: this.halfLineHeight*2*j+this.topMargin, fill: '#000', width: 200, height: 1 });
        line.id=j;
        line.selectable = false;
        startCanvas.add(line);
    }

    let offset = flag?0:-20;
    let groupStart = new fabric.Group([
      flag?this.reddah.trebleClef():this.reddah.baseClef(),
      this.reddah.pai(n1, true, offset),
      this.reddah.pai(n2, false, offset)
    ],
    {
      left: 15,
      top: (flag?0:this.halfLineHeight*2) + this.topMargin,
      scaleY: 1.5,
      scaleX: 1.5
    })

    groupStart.selectable = false;
    groupStart.lockMovementX = true;
    groupStart.lockMovemenY = true;
    groupStart.lockRotation = true;
    groupStart.hasBorders = false;
    groupStart.hasControls = false;
    startCanvas.add(groupStart);
  }

  currentIndex = new Map()
    .set(0,0)
    .set(1,0);

  rest(n, canvasIndex, left, top, scaleY, scaleX){
    let group0 = new fabric.Group([this.reddah.rest('r'+n)],{
      left: left,
      top: top,
      scaleY: scaleY,
      scaleX: scaleX
    })
    
    if(n==1) {group0.left = group0.left-group0.width/2;}
    group0.lockMovementX = true;
    group0.lockMovementY = true;
    group0.lockRotation = true;
    group0.hasBorders = false;
    group0.hasControls = false;
    group0.noteKey = 'r';
    group0.pai = 1/n;
    group0.tag = "rest"
    group0.noteIndex = this.reddah.nonce_str();
    
    this.canvasBox[this.currentClef][canvasIndex].canvas.add(group0);
    this.setLastTarget(this.currentClef, group0, canvasIndex);
  }

  addRest(n){
    let clef = this.currentClef;
    let canvasIndex = parseInt(this.currentIndex.get(clef)/this.beatsPerBar+"");
    //console.log(clef+""+canvasIndex+this.currentIndex.get(clef));

    //this.canvasBox[clef][canvasIndex].sound.push(9);
    let p = 0;
    //if(Array.from(this.reddah.rests.keys()).indexOf(n)>-1)
    if(n=='r64'){
      p = 64;
      this.rest(p, canvasIndex,
        15+(this.currentIndex.get(this.currentClef)%this.beatsPerBar)*50, 
        this.halfLineHeight*2 + this.topMargin, 1, 1);
    }
    else if(n=='r32'){
      p = 32;
      this.rest(p, canvasIndex,
        15+(this.currentIndex.get(this.currentClef)%this.beatsPerBar)*50, 
        this.halfLineHeight*2 + this.topMargin, 1, 1);
    }
    else if(n=='r16'){
      p = 16;
      this.rest(p, canvasIndex,
        15+(this.currentIndex.get(this.currentClef)%this.beatsPerBar)*50, 
        this.halfLineHeight*4 + this.topMargin, 1.5, 1.2);
    }
    else if(n=='r8'){
      p = 8;
      this.rest(p, canvasIndex,
        15+(this.currentIndex.get(this.currentClef)%this.beatsPerBar)*50, 
        this.halfLineHeight*4 + this.topMargin, 1.5, 1.2);
    }
    else if(n=='r4'){
      p = 4;
      this.rest(p, canvasIndex,
        15+(this.currentIndex.get(this.currentClef)%this.beatsPerBar)*50, 
        this.halfLineHeight*3 + this.topMargin, 1.5, 1.2);
    }
    else if(n=='r2'){
      p = 2;
      this.rest(p, canvasIndex,
        15+(this.currentIndex.get(this.currentClef)%this.beatsPerBar)*50, 
        this.halfLineHeight*5 + this.topMargin, 1.5, 1.2);
    }
    else if(n=='r1'){
      p = 1;
      console.log(clef+"_"+canvasIndex)
      this.rest(p, canvasIndex,
        this.canvasBox[clef][canvasIndex].canvas.width/2, 
        this.halfLineHeight*4 + this.topMargin, 1.5, 1.2);
    }

    //this.clearAllUnderlines();
    //this.resetNoteKeyAndUnderlines();

    this.currentIndex.set(clef, this.currentIndex.get(clef)+1/p*this.beatsPerBar);

  }


  addNote(n){
    let color=n==1?"#000":"#0f0";

    let defaultNoteKey ='c4';

    let clef = this.currentClef;
    let canvasIndex = parseInt(this.currentIndex.get(clef)/this.beatsPerBar+"");
    //addthis.canvasBox[clef][canvasIndex].sound.push(9);


    if(n==1){
      let group1 = new fabric.Group([
        this.reddah.hollowHead(),
        this.reddah.stem('stemwhole',11,0,'transparent'),
        this.reddah.stem('stemwhole',0,42,'transparent')],{
        //left: this.canvasBox[clef][canvasIndex].canvas.width/2,
        left: 15+(this.currentIndex.get(clef)%this.beatsPerBar)*50,
        top: this.halfLineHeight*6 + this.topMargin,
      })

      //group1.left = group1.left-group1.width/2;
      group1.lockMovementX = true;
      group1.lockRotation = true;
      group1.hasBorders = false;
      group1.hasControls = false;
      group1.noteKey = defaultNoteKey;
      group1.pai = 1;
      group1.noteIndex = this.reddah.nonce_str();
      console.log("whole:"+group1.noteIndex)
      //this.canvasBox[clef][canvasIndex].sound[group1.noteIndex] = defaultNoteKey;
      this.canvasBox[clef][canvasIndex].canvas.add(group1);
      this.setLastTarget(this.currentClef, group1, canvasIndex);
    }
    else if(n==2){
      let group2 = new fabric.Group([
        this.reddah.hollowHead(),
        this.reddah.stemUp()
        ,this.reddah.stemDown()],{
        left: 15+(this.currentIndex.get(clef)%this.beatsPerBar)*50,
        top: this.halfLineHeight*6 + this.topMargin,
      })
      group2.lockMovementX = true;
      group2.lockRotation = true;
      group2.hasBorders = false;
      group2.hasControls = false;
      group2.noteKey = defaultNoteKey;
      group2.pai = 1/2;
      group2.noteIndex = this.reddah.nonce_str();
      console.log("1/2:"+group2.noteIndex)
      //this.canvasBox[clef][canvasIndex].sound[group2.noteIndex] = defaultNoteKey;
      this.canvasBox[clef][canvasIndex].canvas.add(group2);
      this.setLastTarget(this.currentClef, group2, canvasIndex);
    }
    else if(n==4){
      let group4 = new fabric.Group([
          this.reddah.solidHead(),
          this.reddah.stemUp(),
          this.reddah.stemDown()],{
        left: 15+(this.currentIndex.get(clef)%this.beatsPerBar)*50,
        top: this.halfLineHeight*6 + this.topMargin,
      })
      group4.lockMovementX = true;
      group4.lockRotation = true;
      group4.hasBorders = false;
      group4.hasControls = false;
      group4.noteKey = defaultNoteKey;
      group4.pai = 1/4;
      group4.noteIndex = this.reddah.nonce_str();
      console.log("1/4:"+group4.noteIndex)
      //this.canvasBox[clef][canvasIndex].sound[group4.noteIndex] = defaultNoteKey;
      this.canvasBox[clef][canvasIndex].canvas.add(group4);
      this.setLastTarget(this.currentClef, group4, canvasIndex);
    }
    else if(n==8){
      console.log(8)
      let group8 = new fabric.Group([
          this.reddah.solidHead(),
          this.reddah.stemUp(),
          this.reddah.stemDown(),
          this.reddah.tailUp(1),
          this.reddah.tailDown(1),
        ],{
        left: 15+(this.currentIndex.get(clef)%this.beatsPerBar)*50,
        top: this.halfLineHeight*6 + this.topMargin,
      })
      group8.lockMovementX = true;
      group8.lockRotation = true;
      group8.hasBorders = false;
      group8.hasControls = false;
      group8.noteKey = defaultNoteKey;
      group8.pai = 1/8;
      group8.noteIndex = this.reddah.nonce_str();
      //this.canvasBox[clef][canvasIndex].sound[group8.noteIndex] = defaultNoteKey;
      this.canvasBox[clef][canvasIndex].canvas.add(group8);
      this.setLastTarget(this.currentClef, group8, canvasIndex);
    }
    else if(n==16)
    {
      let group16 = new fabric.Group([
        this.reddah.solidHead(),
        this.reddah.stemUp(),
        this.reddah.stemDown(),
        this.reddah.tailUp(2), 
        this.reddah.tailDown(2),
      ],{
        left: 15+(this.currentIndex.get(clef)%this.beatsPerBar)*50,
        top: this.halfLineHeight*6 + this.topMargin,
      })
      group16.lockMovementX = true;
      group16.lockRotation = true;
      group16.hasBorders = false;
      group16.hasControls = false;
      group16.noteKey = defaultNoteKey;
      group16.pai = 1/16;
      group16.noteIndex = this.reddah.nonce_str();
      //this.canvasBox[clef][canvasIndex].sound[group16.noteIndex] = defaultNoteKey;
      this.canvasBox[clef][canvasIndex].canvas.add(group16);
      this.setLastTarget(this.currentClef, group16, canvasIndex);
    }
    else if(n==32)
    {
      let group32 = new fabric.Group([
        this.reddah.solidHead(),
        this.reddah.stemUp(),
        this.reddah.stemDown(),
        this.reddah.tailUp(3), 
        this.reddah.tailDown(3),
      ],{
        left: 15+(this.currentIndex.get(clef)%this.beatsPerBar)*50,
        top: this.halfLineHeight*6 + this.topMargin,
      })
      group32.lockMovementX = true;
      group32.lockRotation = true;
      group32.hasBorders = false;
      group32.hasControls = false;
      group32.noteKey = defaultNoteKey;
      group32.pai = 1/32;
      group32.noteIndex = this.reddah.nonce_str();
      //this.canvasBox[clef][canvasIndex].sound[group32.noteIndex] = defaultNoteKey;
      this.canvasBox[clef][canvasIndex].canvas.add(group32);
      this.setLastTarget(this.currentClef, group32, canvasIndex);
    }
    else if(n==64)
    {
      let group64 = new fabric.Group([
        this.reddah.solidHead(),
        this.reddah.stemUp(),
        this.reddah.stemDown(),
        this.reddah.tailUp(4), 
        this.reddah.tailDown(4),
      ],{
        left: 15+(this.currentIndex.get(clef)%this.beatsPerBar)*50,
        top: this.halfLineHeight*6 + this.topMargin,
      })
      group64.lockMovementX = true;
      group64.lockRotation = true;
      group64.hasBorders = false;
      group64.hasControls = false;
      group64.noteKey = defaultNoteKey;
      group64.pai = 1/64;
      group64.noteIndex = this.reddah.nonce_str();
      //this.canvasBox[clef][canvasIndex].sound[group64.noteIndex] = defaultNoteKey;
      this.canvasBox[clef][canvasIndex].canvas.add(group64);
      this.setLastTarget(this.currentClef, group64, canvasIndex);
    }
    this.playNote(defaultNoteKey);

    this.clearAllUnderlines();
    this.resetNoteKeyAndUnderlines();

    //this.currentIndex.set(clef, this.currentIndex.get(clef)+1);
    this.currentIndex.set(clef, this.currentIndex.get(clef)+1/n*this.beatsPerBar);


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

  onChange(clef, e, i) {
      e.target.setCoords();
      this.canvasBox[clef][i].canvas.forEachObject((obj)=> {     
        if (obj === e.target) return;

        if(this.getHead(e.target).intersectsWithObject(obj)){
          obj.set('opacity' , 0.5);
          if(obj.tag=='sub')
            obj.set('fill' , '#000000');
        }
        else{ 
          obj.set('opacity' , 1);
          if(obj.tag=='sub')
            obj.set('fill' , 'transparent');
        }
        
      });
  }

  setLastTarget(clef, target, canvasIndex){
    if(this.lastTarget!=null){
      let objects = this.lastTarget.canvas.getObjects();
      for(let j = 0; j < objects.length; j++){
        if(objects[j].type=="group"){
          let grpObjects = objects[j].getObjects();
          for(let k=0;k<grpObjects.length;k++){
            if(grpObjects[k].tag=="rest"){
              grpObjects[k].set('fill', '#000000');
            }
          }
          
        }
      }
      if(this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas)
        this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas.requestRenderAll();
    }

    this.currentClef = clef;
    this.lastTarget = target;
    this.lastCanvasIndex = canvasIndex;
    this.lastNoteIndex = target.noteIndex;

    let objects = this.lastTarget.canvas.getObjects();
    for(let j = 0; j < objects.length; j++){
      if(objects[j].type=="group"){
        let grpObjects = objects[j].getObjects();
        for(let k=0;k<grpObjects.length;k++){
          if(grpObjects[k].tag=="rest"){
            grpObjects[k].set('fill', 'red');
          }
        }
        
      }
    }

    this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas.requestRenderAll();

  }

  clearLastTarget(){
    this.lastCanvasIndex = null;
    this.lastNoteIndex = null;
    this.lastTarget = null;
  }

  lastCanvasIndex = 0;
  lastNoteIndex = 0;
  lastTarget;

  animate(clef, e, dir, i) {
      //console.log("animate:"+clef+"-"+dir+"-canvasindex:"+i)
      if (e.target) {
        if(e.target.type!="group") return;
        this.setLastTarget(clef, e.target, i);
        if(dir==1){//mousedown
          this.clearAllUnderlines();
        }
        if(dir==0){//mouseup
          e.target.setCoords();
          this.resetNoteKeyAndUnderlines();
        }
          

        /*fabric.util.animate({
          startValue: etarget.get('angle'),
          endValue: etarget.get('angle') + (dir ? 10 : -10),
          duration: 100,
          onChange: (value)=> {
            etarget._setOriginToCenter();
            this.canvasBox[i].canvas.renderAll();
          },
          onComplete:()=> {
            etarget.setCoords();
          }
        });
        fabric.util.animate({
          startValue: etarget.get('scaleX'),
          endValue: etarget.get('scaleX') + (dir ? 0.2 : -0.2),
          duration: 100,
          onChange: (value)=> {
            etarget.scale(value);
            this.canvasBox[i].canvas.renderAll();
          },
          onComplete: ()=> {
            etarget.setCoords();
          }
        });*/
      }
    }

    clearAllUnderlines(){
      let groupId = this.lastCanvasIndex+"_"+this.lastNoteIndex;

      //remove all under lines for current target
      let objects = this.lastTarget.canvas.getObjects();
      for(let j = 0; j < objects.length; j++){
        if(objects[j].type=="group"){
          let grpObjects = objects[j].getObjects();

          for(let k=0;k<grpObjects.length;k++){
            if(grpObjects[k].tag=="underline"){
              
              if(grpObjects[k].gid==groupId){
                objects[j].remove(grpObjects[k]);
              }
            }
          }
          
        }
      }
    }

    resetNoteKeyAndUnderlines(){
        let a=0,b=0;
        let clef = this.currentClef;
        let i = this.lastCanvasIndex;
        let etarget = this.lastTarget;

        this.canvasBox[clef][i].canvas.forEachObject((obj)=> {
          if (obj === etarget) return;

          if(this.getHead(etarget).intersectsWithObject(obj)){
            if(obj.tag=='sub'){
                obj.set('fill' , 'transparent');
            }

            if(a==0){
              a = obj.id;
            }
            else{
              b = obj.id;
            }
          }
        });
          
        console.log(a+"_"+b)

      
        if(a+"_"+b=="14_0"){
          etarget.noteKey = 'a6';
          //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'a6';
          if(etarget.type=='group'){
            let groupId = i+"_"+etarget.noteIndex;
            etarget.add(this.reddah.uperLine(groupId, 1, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 2, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 3, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 4, etarget.pai));
          }
          etarget.top = this.halfLineHeight*-6+this.topMargin - this.halfLineHeight*6;
        }
        else if(a+"_"+b=="13_14"){
          etarget.noteKey = 'g6';
          //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'g6';
          if(etarget.type=='group'){
            let groupId = i+"_"+etarget.noteIndex;
            etarget.add(this.reddah.uperLine(groupId, 1.5, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 2.5, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 3.5, etarget.pai));
          }
          etarget.top = this.halfLineHeight*-5+this.topMargin - this.halfLineHeight*6;
        }
        else if(a+"_"+b=="13_0"){
          etarget.noteKey = 'f6';
          //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'f6';
          if(etarget.type=='group'){
            let groupId = i+"_"+etarget.noteIndex;
            etarget.add(this.reddah.uperLine(groupId, 1, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 2, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 3, etarget.pai));
          }
          etarget.top = this.halfLineHeight*-4+this.topMargin - this.halfLineHeight*6;
        }
        else if(a+"_"+b=="12_13"){
          etarget.noteKey = 'e6';
          //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'e6';
          if(etarget.type=='group'){
            let groupId = i+"_"+etarget.noteIndex;
            etarget.add(this.reddah.uperLine(groupId, 1.5, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 2.5, etarget.pai));
          }
          etarget.top = this.halfLineHeight*-3+this.topMargin - this.halfLineHeight*6;
        }
        else if(a+"_"+b=="12_0"){
          etarget.noteKey = 'd6';
          //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'd6';
          if(etarget.type=='group'){
            let groupId = i+"_"+etarget.noteIndex;
            etarget.add(this.reddah.uperLine(groupId, 1, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 2, etarget.pai));
          }
          etarget.top = this.halfLineHeight*-2+this.topMargin - this.halfLineHeight*6;
        }
        else if(a+"_"+b=="11_12"){
          etarget.noteKey = 'c6';
          //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'c6';
          if(etarget.type=='group'){
            let groupId = i+"_"+etarget.noteIndex;
            etarget.add(this.reddah.uperLine(groupId, 1.5, etarget.pai));
          }
          etarget.top = this.halfLineHeight*-1+this.topMargin - this.halfLineHeight*6;
        }
        else if(a+"_"+b=="11_0"){
          etarget.noteKey = 'b5';
          //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'b5';
          if(etarget.type=='group'){
            let groupId = i+"_"+etarget.noteIndex;
            etarget.add(this.reddah.uperLine(groupId, 1, etarget.pai));
          }
          etarget.top = this.halfLineHeight*0+this.topMargin - this.halfLineHeight*6;
        }
        else if(a+"_"+b=="11_1"){
          etarget.noteKey = 'g5';
          //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'g5';
          etarget.top = this.halfLineHeight*1+this.topMargin - this.halfLineHeight*6;
        }


        else if(a+"_"+b=="1_0"){
          etarget.noteKey = 'f5';
          //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'f5';
          etarget.top = this.halfLineHeight*2+this.topMargin - this.halfLineHeight*6;
        }else if(a+"_"+b=="1_2"){
          etarget.noteKey = 'e5';
          //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'e5';
          etarget.top = this.halfLineHeight*3+this.topMargin - this.halfLineHeight*6;
        }else if(a+"_"+b=="2_0"){
          etarget.noteKey = 'd5';
          //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'd5';
          etarget.top = this.halfLineHeight*4+this.topMargin - this.halfLineHeight*6;
        }else if(a+"_"+b=="2_3"){
          etarget.noteKey = 'c5';
          //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'c5';
          etarget.top = this.halfLineHeight*5+this.topMargin - this.halfLineHeight*6;
        }else if(a+"_"+b=="3_0"){
          etarget.noteKey = 'b4';
          //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'b4';
          etarget.top = this.halfLineHeight*6+this.topMargin - this.halfLineHeight*6;
        }
        else
        {
          if(a+"_"+b=="3_4"){
            etarget.noteKey = 'a4';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'a4';
            etarget.top = this.halfLineHeight*7+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="4_0"){
            etarget.noteKey = 'g4';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'g4';
            etarget.top = this.halfLineHeight*8+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="4_5"){
            etarget.noteKey = 'f4';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'f4';
            etarget.top = this.halfLineHeight*9+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="5_0"){
            etarget.noteKey = 'e4';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'e4';
            etarget.top = this.halfLineHeight*10+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="5_6"){
            etarget.noteKey = 'd4';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'd4';
            etarget.top = this.halfLineHeight*11+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="6_0"){
            etarget.noteKey = 'c4';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'c4';
            //add current under lines
            if(etarget.type=='group'){
              let groupId = i+"_"+etarget.noteIndex;
              etarget.add(this.reddah.underLine(groupId, 1, etarget.pai));
            }
            etarget.top = this.halfLineHeight*12+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="6_7"){
            etarget.noteKey = 'b3';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'b3';
            //add current under lines
            if(etarget.type=='group'){
              let groupId = i+"_"+etarget.noteIndex;
              etarget.add(this.reddah.underLine(groupId, 1.5, etarget.pai));
            }
            etarget.top = this.halfLineHeight*13+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="7_0"){
            etarget.noteKey = 'a3';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'a3';
            //add current under lines
            if(etarget.type=='group'){
              let groupId = i+"_"+etarget.noteIndex;
              etarget.add(this.reddah.underLine(groupId, 1, etarget.pai));
              etarget.add(this.reddah.underLine(groupId, 2, etarget.pai));
            }
            etarget.top = this.halfLineHeight*14+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="7_8"){
            etarget.noteKey = 'g3';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'g3';
            //add current under lines
            if(etarget.type=='group'){
              let groupId = i+"_"+etarget.noteIndex;
              etarget.add(this.reddah.underLine(groupId, 1.5, etarget.pai));
              etarget.add(this.reddah.underLine(groupId, 2.5, etarget.pai));
            }
            etarget.top = this.halfLineHeight*15+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="8_0"){
            etarget.noteKey = 'f3';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'f3';
            //add current under lines
            if(etarget.type=='group'){
              let groupId = i+"_"+etarget.noteIndex;
              etarget.add(this.reddah.underLine(groupId, 1, etarget.pai));
              etarget.add(this.reddah.underLine(groupId, 2, etarget.pai));
              etarget.add(this.reddah.underLine(groupId, 3, etarget.pai));
            }
            etarget.top = this.halfLineHeight*16+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="8_9"){
            etarget.noteKey = 'e3';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'e3';
            //add current under lines
            if(etarget.type=='group'){
              let groupId = i+"_"+etarget.noteIndex;
              etarget.add(this.reddah.underLine(groupId, 1.5, etarget.pai));
              etarget.add(this.reddah.underLine(groupId, 2.5, etarget.pai));
              etarget.add(this.reddah.underLine(groupId, 3.5, etarget.pai));
            }
            etarget.top = this.halfLineHeight*17+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="9_0"){
            etarget.noteKey = 'd3';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'd3';
            //add current under lines
            if(etarget.type=='group'){
              let groupId = i+"_"+etarget.noteIndex;
              etarget.add(this.reddah.underLine(groupId, 1, etarget.pai));
              etarget.add(this.reddah.underLine(groupId, 2, etarget.pai));
              etarget.add(this.reddah.underLine(groupId, 3, etarget.pai));
              etarget.add(this.reddah.underLine(groupId, 4, etarget.pai));
            }
            etarget.top = this.halfLineHeight*18+this.topMargin - this.halfLineHeight*6;
          }
        }

        if(["rest"].indexOf(etarget.tag)==-1){
          this.playNote(etarget.noteKey);
        }

        this.checkStemTailTurnAround();

        
    }


    checkStemTailTurnAround(){
      let isUnderb4 = this.keys88.indexOf(this.lastTarget.noteKey)<this.keys88.indexOf('b4');
      let target = this.lastTarget;
      let i = this.lastCanvasIndex; 

      let objects = target.canvas.getObjects();
      for(let j = 0; j < objects.length; j++){
        if(objects[j].type=="group"&&
        objects[j].noteIndex==this.lastNoteIndex&&
        this.lastCanvasIndex==i){
          let grpObjects = objects[j].getObjects();
          for(let k=0;k<grpObjects.length;k++){
            console.log(grpObjects[k].tag)
            if(["stemup"].indexOf(grpObjects[k].tag)>-1){
                grpObjects[k].set('stroke' , isUnderb4?'#000000':'transparent');
            }
            if(["tailup"].indexOf(grpObjects[k].tag)>-1){
                grpObjects[k].set('fill' , isUnderb4?'#000000':'transparent');
            }
            if(["stemdown"].indexOf(grpObjects[k].tag)>-1){
                grpObjects[k].set('stroke' , isUnderb4?'transparent':'#000000');
            }
            if(["taildown"].indexOf(grpObjects[k].tag)>-1){
                grpObjects[k].set('fill' , isUnderb4?'transparent':'#000000');
            }
          }
          
        }
      }
    }

    time;
    isPlay = false;
    speed = 80;

   


    play=()=>{
        this.isPlay = true;
        
        window.clearTimeout(this.time);
        this.playBar();
        if (this.isPlay) {
            this.time = window.setTimeout(this.play, Math.floor(60000 / this.speed));
        };
    }

    stop(){
      this.playIndex=0;
      this.isPlay = false;
      window.clearTimeout(this.time);
    }

    audioCtx = new AudioContext();

    currentJump = new Map()
    .set(0,0)
    .set(1,0);

    currentBeatIndex = new  Map()
    .set(0,0)
    .set(1,0);

    playIndex = 0;
    playBar(){
      let lastJump = this.currentJump.get(this.currentClef);
      
      let canvasIndex = parseInt(this.playIndex/this.beatsPerBar+"");
      let playBeatIndex = parseInt(this.playIndex%this.beatsPerBar+"");
      let beatIndex = this.currentBeatIndex.get(this.currentClef);


      if(this.playIndex%this.beatsPerBar==0){
        this.currentBeatIndex.set(this.currentClef, 0);
        beatIndex = 0;
      }

      this.cursorAnimations(canvasIndex, playBeatIndex);
      
      if(lastJump<=0)
      {
        let beat = this.getBeat(canvasIndex, beatIndex);

        this.currentJump.set(this.currentClef, beat.last-1);

        console.log(beat);

        if(beat.frequency!=0){
          let oscillator = this.audioCtx.createOscillator();
          let gainNode = this.audioCtx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(this.audioCtx.destination);
          oscillator.type = 'sine';
          
          oscillator.frequency.value = beat.frequency;

          let singleBeatTime = Math.floor(60000 / this.speed)/1000;
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + beat.last*singleBeatTime);
          console.log(beat.last*singleBeatTime)
          oscillator.start(this.audioCtx.currentTime);
          oscillator.stop(this.audioCtx.currentTime + beat.last*singleBeatTime);

        }

        this.currentBeatIndex.set(this.currentClef, beatIndex+1);

      }else{
        this.currentJump.set(this.currentClef, lastJump-1);
      }

      console.log("lastjump:"+this.currentJump.get(this.currentClef))

      if(this.playIndex!=this.canvasBox[this.currentClef].length*this.beatsPerBar-1)
      {  
          this.playIndex++;
      }
      else{
          this.stop();
      }
    }

    getBeat(canvasIndex, beatIndex){
      let result = { 
        frequency: 0, 
        last: 1
      }
      let clef = this.currentClef;
      if((canvasIndex>this.canvasBox[clef].length-1)||canvasIndex<0){
        return result;
      }
      if((beatIndex>this.beatsPerBar)||beatIndex<0){
        return result;
      }
      
      let fValue = 'c4';
      let lValue = 1;

      let flag = false;
      let count = 0;
      let objects = this.canvasBox[clef][canvasIndex].canvas.getObjects();
      for(let j = 0; j < objects.length; j++){
        if(objects[j].type=="group"){
          if(count==beatIndex)
          {
              fValue = objects[j].noteKey;
              lValue = objects[j].pai; 
              flag = true;
              break;
          }

          count++;
          
        }
      }

      if(flag){
        result.frequency = this.reddah.f.get(fValue);
        result.last = lValue/(1/this.beatsPerBar);
      }
      else{
        result.frequency = 0;
        result.last = 1;
      }

      console.log('NoteKey:'+fValue+" Last:"+lValue+" beatIndex:"+beatIndex)

      return result;
  }

    playNote(key){
      console.log("play:"+key)
      let oscillator = this.audioCtx.createOscillator();
      let gainNode = this.audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      oscillator.type = 'sine';

      oscillator.frequency.value = this.reddah.f.get(key);
      gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + 0.01);
      
      oscillator.start(this.audioCtx.currentTime);
      oscillator.stop(this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1);
      oscillator.stop(this.audioCtx.currentTime + 1);
    }

    

    accidental(tag){
      if(this.lastTarget!=null){
        let groupId = this.lastCanvasIndex + "_" + this.lastNoteIndex;
        

        let flag = true;
        let grpObjects = this.lastTarget.getObjects();
        for(let k=0;k<grpObjects.length;k++){
          if(Array.from(this.reddah.accidentals.keys()).filter(a => a != tag).indexOf(grpObjects[k].tag)>-1){
            this.lastTarget.remove(grpObjects[k]);
          }
          if(grpObjects[k].tag===tag){
            this.lastTarget.remove(grpObjects[k]);
            flag = false;
          }
        }  
        
        if(flag){
          this.lastTarget.add(this.reddah.accidental(tag, groupId, 1, this.lastTarget.pai));
        }

        this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas.requestRenderAll();
      }
    }


    dot(){
      if(this.lastTarget!=null){
        let groupId = this.lastCanvasIndex + "_" + this.lastNoteIndex;
        

        let flag = true;
        let grpObjects = this.lastTarget.getObjects();
        for(let k=0;k<grpObjects.length;k++){
          if(["dot"].indexOf(grpObjects[k].tag)>-1){
            this.lastTarget.remove(grpObjects[k]);
            flag = false;
          }
        }  
        
        if(flag){
          this.lastTarget.add(this.reddah.dot(groupId, 1, this.lastTarget.pai));
        }
        
        /*let objects = this.canvasBox[this.lastCanvasIndex].canvas.getObjects();
        for(let i = 0; i < objects.length; i++){
            if(objects[i].type=="group"&&objects[i].noteIndex==this.lastNoteIndex){
              console.log(objects[i])
              objects[i].add(this.reddah.dot(groupId, 1));
            }
        }*/

        this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas.requestRenderAll();

      }
    }

    move(flag){
      this.clearAllUnderlines();

      let keys = this.keys88.filter(k=>k.indexOf('#')==-1);
      //console.log(keys)
      let newNoteKey = keys[keys.indexOf(this.lastTarget.noteKey)+flag];
      this.lastTarget.noteKey = newNoteKey;
      //this.canvasBox[this.currentClef][this.lastCanvasIndex].sound[this.lastNoteIndex] = newNoteKey;
      this.lastTarget.top -= this.halfLineHeight*flag;
      
      this.resetNoteKeyAndUnderlines();

      this.playNote(this.lastTarget.noteKey);

      this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas.requestRenderAll();
    }


}
