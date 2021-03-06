import { Component, OnInit } from '@angular/core';
import {fabric} from 'fabric'
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  showGrid = false;
  startCanvasBox = [];
  canvasBox = [[],[]];

  beatsPerBar = 4;  //up
  beatNote = 4; //down
  keySignature = "C";

  defaultColor = 'black';
  highlightColor = 'red';

  currentClef = 0;
  keys88 = Array.from(this.reddah.f.keys());

  constructor(
    private reddah : ReddahService,
    ) {}


  toJSON(canvas){
    return canvas.toJSON([
      'id','pai','noteIndex','noteKey','tag',
      'accidental','type','finger','pause',
      'chord','tie','rest','dot','underline',
      'number','time','key','clef','front','end','bar2lines',

      'selectable',
      'lockMovementX',
      'lockMovementY',
      'lockRotation',
      'hasBorders',
      'hasControls',
    ]);
  }

  save(){

    let canvasArray0 = [];
    let canvasArray1 = [];
    for(let i=0;i<this.canvasBox[0].length;i++){
      let canvas0 = this.canvasBox[0][i].canvas;
      canvasArray0.push(this.toJSON(canvas0));

      let canvas1 = this.canvasBox[1][i].canvas;
      canvasArray1.push(this.toJSON(canvas1));
    }

    let music = {
      beatsPerBar: this.beatsPerBar, 
      beatNote: this.beatNote,
      keySignature: this.keySignature,
      canvas0: canvasArray0,
      canvas1: canvasArray1,
    }

    this.reddah.save(JSON.stringify(music));


  }

  load(readOnly=true){
    let music = JSON.parse(this.reddah.load("1"));
    this.beatsPerBar = music.beatsPerBar;
    this.beatNote = music.beatNote;
    this.keySignature = music.keySignature;

    //load key/time signaure
    this.updateKey(true);
    this.updateKey(false);
    this.updateTime(true);
    this.updateTime(false);

    let barCount = music.canvas0.length;
    if(barCount>3){
      for(let i=0;i<barCount-3;i++){
          this.addBar(null);
      }
    }
    
    setTimeout(() =>{

      for(let i=0;i<this.canvasBox[0].length;i++){
        let canvas0 = this.canvasBox[0][i].canvas;
        canvas0.loadFromJSON(music.canvas0[i], canvas0.renderAll.bind(canvas0));
        
        let canvas1 = this.canvasBox[1][i].canvas;
        canvas1.loadFromJSON(music.canvas1[i], canvas1.renderAll.bind(canvas1));
      
        if(readOnly){
          let obj0 = canvas0.getObjects();
          let obj1 = canvas1.getObjects();
          for(let j=0;j<obj0.length; j++){
            if(obj0[j].type=="group"){
              obj0[j].lockMovementY = true;
              obj0[j].selectable = false;
            }
          }
          for(let j=0;j<obj1.length; j++){
            if(obj1[j].type=="group"){
              obj1[j].lockMovementY = true;
              obj1[j].selectable = false;
            }
          }
        }
      }
      
    },1);

  }

  

  hideActionBar = true;

  hideActionBarVisibility(){
    this.hideActionBar = true;
    for(let i=0;i<this.canvasBox[0].length;i++){
      let canvas0 = this.canvasBox[0][i].canvas;
      canvas0.setBackgroundColor('white', canvas0.renderAll.bind(canvas0));
      let canvas1 = this.canvasBox[1][i].canvas;
      canvas1.setBackgroundColor('white', canvas1.renderAll.bind(canvas1));
    }
    if(this.lastTarget!=null){
      this.setLastTargetColor(this.lastTarget, this.defaultColor);
    }
  }


  startCanvasSelected = false;
  currentCanvasIndex;
  showActionBarVisibility(clef, canvasIndex){
    this.currentCanvasIndex = canvasIndex;
    this.hideActionBar = false;
    this.currentClef = clef;
    
    if(canvasIndex==-1){
      this.startCanvasSelected = true;
      this.startCanvasBox[0].setBackgroundColor('lightcyan', this.startCanvasBox[0].renderAll.bind(this.startCanvasBox[0]));
      this.startCanvasBox[1].setBackgroundColor('lightcyan', this.startCanvasBox[1].renderAll.bind(this.startCanvasBox[1]));
    }
    else{
      this.startCanvasSelected = false;
      this.startCanvasBox[0].setBackgroundColor('white', this.startCanvasBox[0].renderAll.bind(this.startCanvasBox[0]));
      this.startCanvasBox[1].setBackgroundColor('white', this.startCanvasBox[1].renderAll.bind(this.startCanvasBox[1]));
    }
    for(let i=0;i<this.canvasBox[clef].length;i++){
      let canvas0 = this.canvasBox[0][i].canvas;
      canvas0.setBackgroundColor('white', canvas0.renderAll.bind(canvas0));
      let canvas1 = this.canvasBox[1][i].canvas;
      canvas1.setBackgroundColor('white', canvas1.renderAll.bind(canvas1));
      
      if(i==canvasIndex){
        let canvas0 = this.canvasBox[clef][canvasIndex].canvas;
        canvas0.setBackgroundColor('lightcyan', canvas0.renderAll.bind(canvas0));
      }
    }

    
  }
  
  changeTime(beatsPerBar, beatNote){
    this.beatsPerBar = beatsPerBar;
    this.beatNote = beatNote;

    this.updateTime(true);
    this.updateTime(false);
  }

  updateTime(flag){
    let clef = flag?0:1;
    let objects = this.startCanvasBox[clef].getObjects()
    for(let j = 0; j < objects.length; j++){
      if(objects[j].type=="group"&&objects[j].tag=="time"){
        this.startCanvasBox[clef].remove(objects[j]);
      }
    }
    this.startCanvasBox[clef].add(this.createTimeGroup(flag, this.beatsPerBar, this.beatNote));
  }

  changeKey(key){
    this.keySignature = key;

    this.updateKey(true);
    this.updateKey(false);
    this.updateTime(true);
    this.updateTime(false);
  }

  updateKey(flag){
    let clef = flag?0:1;
    let objects = this.startCanvasBox[clef].getObjects()
    for(let j = 0; j < objects.length; j++){
      if(objects[j].type=="group"&&objects[j].tag=="key"){
        this.startCanvasBox[clef].remove(objects[j]);
      }
    }

    let group = this.createKeyGroup(flag);
    if(group)
      this.startCanvasBox[clef].add(group);
  }

  createKeyGroup(flag){
    let group = null;
    let top = this.topMargin;
    if(this.keySignature=="C")
      return group;
    
    if(this.keySignature=="G"){
      group =[
        this.reddah.accidental("sharp", "", 1, 0, this.defaultColor)
      ];
      top += 3;
    }
    if(this.keySignature=="F"){
      group =[
        this.reddah.accidental("flat", "", 1, 0, this.defaultColor)
      ]
      top += 30;
    }

    let groupStart = new fabric.Group(group, { left: 70, top: top })
    groupStart.selectable = false;
    groupStart.lockMovementX = true;
    groupStart.lockMovementY = true;
    groupStart.lockRotation = true;
    groupStart.hasBorders = false;
    groupStart.hasControls = false;
    groupStart.tag = "key";

    return groupStart;
  }

  createClefGroup(flag){
    let groupStart = new fabric.Group([
      flag?this.reddah.trebleClef():this.reddah.baseClef()
    ],
    {
      left: 15,
      top: (flag?0:this.halfLineHeight*2) + this.topMargin,
      scaleY: 1.5,
      scaleX: 1.5
    })

    groupStart.selectable = false;
    groupStart.lockMovementX = true;
    groupStart.lockMovementY = true;
    groupStart.lockRotation = true;
    groupStart.hasBorders = false;
    groupStart.hasControls = false;
    groupStart.tag = "clef";

    return groupStart;
  }


  setBarClef(type){
    let preBox = this.canvasBox[this.currentClef][this.currentCanvasIndex-1];
    let currentBox = this.canvasBox[this.currentClef][this.currentCanvasIndex];
    if(currentBox.clef==null)
    {
      currentBox.clef = type;
      let clef = this.createClefGroup(type);
      clef.left = preBox.canvas.width-clef.width*1.5-5;
      preBox.canvas.add(clef);
    }
  }
  clearBarClef(){
    let preBox = this.canvasBox[this.currentClef][this.currentCanvasIndex-1];
    let currentBox = this.canvasBox[this.currentClef][this.currentCanvasIndex];
    if(currentBox.clef!=null)
    {
      let objects = preBox.canvas.getObjects();
      for(let j = 0; j < objects.length; j++){
        if(["clef"].indexOf(objects[j].tag)!=-1)    
          preBox.canvas.remove(objects[j]);
      }
  
      currentBox.clef = null;
    }
  }

  setDoubleBarLine(){
    let deleted = false;
    for(let clef=0;clef<2;clef++){
      let canvas = this.canvasBox[clef][this.currentCanvasIndex].canvas;

      let objects = canvas.getObjects()
      for(let j = 0; j < objects.length; j++){
        if(objects[j].tag=="bar2lines"){
          canvas.remove(objects[j]);
          deleted = true;
        }
      }
    }

    if(!deleted){
      for(let clef=0;clef<2;clef++){
        let frontLine = clef==0? 
        new fabric.Rect({ left: this.barWidth-5, top: this.topMargin+this.halfLineHeight*2, fill: '#000000', width: 1, 
          height: this.topMargin+this.halfLineHeight*2+this.halfLineHeight*13 })
        :
        new fabric.Rect({ left: this.barWidth-5, top: 0, fill: '#000000', width: 1, 
        height: this.topMargin+this.halfLineHeight*2+this.halfLineHeight*8 });
        frontLine.tag='bar2lines'
        frontLine.selectable = false;
        this.canvasBox[clef][this.currentCanvasIndex].canvas.add(frontLine);
      }
    }
  }

  createTimeGroup(flag, n1, n2){
    let keyOffset = 0;
    if(this.keySignature=="C") keyOffset = 0;
    if(this.keySignature=="G"||this.keySignature=="F") 
      keyOffset = 20;
    
    let offset = flag?0:-20;
    let groupStart = new fabric.Group([
      this.reddah.pai(n1, true, offset),
      this.reddah.pai(n2, false, offset)
    ],
    {
      left: 15+ 60 + keyOffset,
      top: this.halfLineHeight*2 + this.topMargin,
      scaleY: 1.5,
      scaleX: 1.5
    })

    groupStart.selectable = false;
    groupStart.lockMovementX = true;
    groupStart.lockMovementY = true;
    groupStart.lockRotation = true;
    groupStart.hasBorders = false;
    groupStart.hasControls = false;
    groupStart.tag = "time";

    return groupStart;
  }

  ngOnInit() {
      for(let i=0;i<3;i++){
          this.canvasBox[0].push({id:i, canvas: null, clef: null});
          this.canvasBox[1].push({id:i, canvas: null, clef: null});
      }
  }


  barStartWidth = 140;
  barWidth = 400;//240
  halfLineHeight = 7;
  topMargin = 60;
  cursorInitLeft = 0;

  ionViewDidEnter(){
    this.addStartCanvas(true, this.beatsPerBar, this.beatNote);
    this.addStartCanvas(false, this.beatsPerBar, this.beatNote);
    
    this.init(0);
    this.init(1);

    this.addEndCanvas(true);
    this.addEndCanvas(false);
  }

  addStartCanvas(flag, n1, n2){
    let canvas = new fabric.Canvas(flag?"startT":"startB");
    canvas.setWidth(this.barStartWidth);
    canvas.setHeight(240);

    canvas.on({
      'mouse:down': (e)=> this.showActionBarVisibility(this.currentClef, -1),
      'mouse:up': (e)=> this.currentClef = flag? 0:1
    });

    let frontLine = flag ? 
      new fabric.Rect({ left: 0, top: this.topMargin+this.halfLineHeight*2, fill: '#000000', width: 1, 
      height:  this.topMargin+this.halfLineHeight*2+this.halfLineHeight*13 })
    :
      new fabric.Rect({ left: 0, top: 0, fill: '#000000', width: 1, 
      height: this.topMargin+this.halfLineHeight*2+this.halfLineHeight*8 });
    frontLine.tag='front'
    frontLine.selectable = false;
    canvas.add(frontLine);

    for(let j=1;j<=5;j++){
        let line = new fabric.Rect({ left: 0, top: this.halfLineHeight*2*j+this.topMargin, fill: '#000', width: this.barWidth, height: 1 });
        line.id=j;
        line.selectable = false;
        canvas.add(line);
    }

    canvas.add(this.createClefGroup(flag));
    canvas.add(this.createTimeGroup(flag, n1, n2));
    this.startCanvasBox.push(canvas);
  }

  addEndCanvas(flag){
    let myCanvas = new fabric.Canvas(flag?"endT":"endB");
    myCanvas.setWidth(11);
    myCanvas.setHeight(240);

    myCanvas.on({
      'mouse:up': (e)=> this.currentClef = flag? 0:1
    });

    for(let j=1;j<=5;j++){
        let line = new fabric.Rect({ left: 0, top: this.halfLineHeight*2*j+this.topMargin, fill: '#000', width: this.barWidth, height: 1 });
        line.id=j;
        line.selectable = false;
        myCanvas.add(line);
    }

    let frontLine = flag ? 
      new fabric.Rect({ left: 0, top: this.topMargin+this.halfLineHeight*2, fill: '#000000', width: 2, 
      height:  this.topMargin+this.halfLineHeight*2+this.halfLineHeight*13 })
    :
      new fabric.Rect({ left: 0, top: 0, fill: '#000000', width: 2, 
      height: this.topMargin+this.halfLineHeight*2+this.halfLineHeight*8 });
    frontLine.tag='end';
    frontLine.selectable = false;
    myCanvas.add(frontLine);


    let frontLine2 = flag ? 
      new fabric.Rect({ left: 5, top: this.topMargin+this.halfLineHeight*2, fill: '#000000', width: 5, 
      height:  this.topMargin+this.halfLineHeight*2+this.halfLineHeight*13 })
    :
      new fabric.Rect({ left: 5, top: 0, fill: '#000000', width: 5, 
      height: this.topMargin+this.halfLineHeight*2+this.halfLineHeight*8 });
    frontLine2.tag='end';
    frontLine2.selectable = false;
    myCanvas.add(frontLine2);

    /*
    let myGroup = new fabric.Group([
      this.reddah.endClef(),
    ],
    {
      left: 0,
      top: this.topMargin+15,
      scaleY: 1,
      scaleX: 1
    })

    myGroup.selectable = false;
    myGroup.lockMovementX = true;
    myGroup.lockMovementY = true;
    myGroup.lockRotation = true;
    myGroup.hasBorders = false;
    myGroup.hasControls = false;
    myCanvas.add(myGroup);
    */
  }

  init(clef){
    for(let i = 0;i<this.canvasBox[clef].length;i++)
    {
      if(this.canvasBox[clef][i].canvas==null){
        this.canvasBox[clef][i].canvas = new fabric.Canvas((clef==0?"t":"b")+this.canvasBox[clef][i].id);
        this.canvasBox[clef][i].canvas.setWidth(this.barWidth);
        this.canvasBox[clef][i].canvas.setHeight(240);


        if(i>0){
          let frontLine = clef==0? 
          new fabric.Rect({ left: 0, top: this.topMargin+this.halfLineHeight*2, fill: '#000000', width: 1, 
            height: this.topMargin+this.halfLineHeight*2+this.halfLineHeight*13 })
          :
          new fabric.Rect({ left: 0, top: 0, fill: '#000000', width: 1, 
          height: this.topMargin+this.halfLineHeight*2+this.halfLineHeight*8 });
          frontLine.tag='front'
          frontLine.selectable = false;
          this.canvasBox[clef][i].canvas.add(frontLine);
        }

        for(let h=11;h<=14;h++){
          let line = new fabric.Rect({ left: 0, top: this.halfLineHeight*2*(11-h)+this.topMargin, fill: 'transparent', width: this.barWidth*10, height: 1 });
          line.id=h;
          line.tag='sub'
          line.selectable = false;
          this.canvasBox[clef][i].canvas.add(line);
        }

        for(let j=1;j<=5;j++){
          let line = new fabric.Rect({ left: 0, top: this.halfLineHeight*2*j+this.topMargin, fill: '#000', width: this.barWidth*10, height: 1 });
          line.id=j;
          line.tag='main'
          line.selectable = false;
          this.canvasBox[clef][i].canvas.add(line);
        }

        for(let j=6;j<=9;j++){
          let line = new fabric.Rect({ left: 0, top: this.halfLineHeight*2*j+this.topMargin, fill: 'transparent', width: this.barWidth*10, height: 1 });
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
            'mouse:down': (e)=> {this.animate(clef, e, 1, i);this.showActionBarVisibility(clef,i)},
            'mouse:up': (e)=> {this.animate(clef, e, 0, i)},
        });
        //this.canvasBox[i].json = this.canvasBox[i].canvas.toJSON();

      }
    }
  }

  cursorAnimation(clef, i, beatIndex) {
      let canvas = this.canvasBox[clef][i].canvas;

      let objects = canvas.getObjects()
      for(let j = 0; j < objects.length; j++){
        if(objects[j].tag=="cursor"){
          
          if(beatIndex==0){
            objects[j].left = this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx;
          }else{
            objects[j].left = objects[j].left+this.noteDistance/2;
          }

          objects[j].set('stroke' , '#aaf');
          objects[j].set('fill' , '#faa');
          
          this.canvasBox[clef][i].canvas.requestRenderAll();
          
          if(beatIndex==this.beatsPerBar*2-1){
            setTimeout(()=>{
              objects[j].left = this.cursorInitLeft;
              objects[j].set('stroke' , 'transparent');
              objects[j].set('fill' , 'transparent');
              if(i<this.canvasBox[clef].length)
                this.canvasBox[clef][i].canvas.requestRenderAll();
            }, Math.floor(60000 / this.speed))
          }
          
          break;
        }
      }
      
  };

  checkAddBar(f){
    let index = this.currentIndex.get(this.currentClef);
    if(index>=this.canvasBox[this.currentClef].length*this.beatsPerBar){
      this.addBar(f);
    }else{
      f();
    }
  }

  addBar(f) {
      let barId = this.canvasBox[0].length;
      this.canvasBox[0].push({id:barId, canvas: null, clef: null});
      this.canvasBox[1].push({id:barId, canvas: null, clef: null});
  
      setTimeout(() => {
        this.init(0);
        this.init(1);
        if(f)
          f();
      },1);
  }

  deleteBars(canvasIndex){
    this.deleteBar(0, canvasIndex);
    this.deleteBar(1, canvasIndex);
  }

  deleteBar(clef, canvasIndex){
    this.canvasBox[clef].splice(canvasIndex,1);
    let index = this.currentIndex.get(clef);
    if(index>canvasIndex*this.beatsPerBar){
      this.currentIndex.set(clef, canvasIndex*this.beatsPerBar);
      this.setDefaultLastTarget(canvasIndex-1);
    }
  }

  insertBar(canvasIndex) {
    let barId = this.canvasBox[0].length;
    
    this.canvasBox[0].splice(canvasIndex, 0, {id:barId, canvas: null, beats: [], json: null});
    this.canvasBox[1].splice(canvasIndex, 0, {id:barId, canvas: null, beats: [], json: null});

    this.addRest(1, this.currentClef, canvasIndex);

    setTimeout(() => {
      this.init(0);
      this.init(1);
    },1)
  }


  deleteLastNote(){
    if(this.lastTarget!=null){
      let objects = this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas.getObjects();
      
      let objs = objects.filter(o=>o.type=="group");
      let lastIndex = objs.length-1;
      let p = objs[lastIndex].pai;
      this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas.remove(objs[lastIndex]);
      this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas.requestRenderAll();
        
      //update index

      //this.setLastTarget(this.currentClef, objs[lastIndex-1], this.lastCanvasIndex);
      this.currentIndex.set(this.currentClef, this.currentIndex.get(this.currentClef)-this.beatNote/p);
      
      

    }

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
        if(["front","main","sub","cursor"].indexOf(objects[j].tag)==-1)    
          this.canvasBox[clef][i].canvas.remove(objects[j]);
      }

      this.canvasBox[clef][i].canvas.setWidth(this.barWidth);
    }

    this.currentIndex.set(clef, 0);
    
    if(this.isPlay)
      this.stop();

    this.clearLastTarget()
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
    if(this.beatsPerBar==2&&n==1) group0.pai = 1/2
    group0.tag = "rest"
    group0.noteIndex = this.reddah.nonce_str();
    
    this.canvasBox[this.currentClef][canvasIndex].canvas.add(group0);
    this.setLastTarget(this.currentClef, group0, canvasIndex);
    console.log(group0)
  }

  noteOffsetx = 13;
  addRest(n, clef=null, canvasIndex=null){
    this.checkAddBar(()=>{
        if(clef==null){
          clef = this.currentClef;
        }
        if(canvasIndex==null){
          canvasIndex = parseInt(this.currentIndex.get(clef)/this.beatsPerBar+"");
        }

        //if(Array.from(this.reddah.rests.keys()).indexOf(n)>-1)
        if(n==64){
          this.rest(n, canvasIndex,
            (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(clef)%this.beatsPerBar)*this.noteDistance, 
            this.halfLineHeight*2 + this.topMargin, 1, 1);
        }
        else if(n==32){
          this.rest(n, canvasIndex,
            (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(clef)%this.beatsPerBar)*this.noteDistance, 
            this.halfLineHeight*2 + this.topMargin, 1, 1);
        }
        else if(n==16){
          this.rest(n, canvasIndex,
            (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(clef)%this.beatsPerBar)*this.noteDistance, 
            this.halfLineHeight*4 + this.topMargin, 1.5, 1.2);
        }
        else if(n==8){
          this.rest(8, canvasIndex,
            (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(clef)%this.beatsPerBar)*this.noteDistance, 
            this.halfLineHeight*4 + this.topMargin, 1.5, 1.2);
        }
        else if(n==4){
          this.rest(4, canvasIndex,
            (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(this.currentClef)%this.beatsPerBar)*this.noteDistance, 
            this.halfLineHeight*3 + this.topMargin, 1.5, 1.2);
        }
        else if(n==2){
          this.rest(2, canvasIndex,
            (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(this.currentClef)%this.beatsPerBar)*this.noteDistance, 
            this.halfLineHeight*5 + this.topMargin, 1.5, 1.2);
        }
        else if(n==1){
          this.rest(n, canvasIndex,
            this.canvasBox[clef][canvasIndex].canvas.width/2, 
            this.halfLineHeight*4 + this.topMargin, 1.5, 1.2);
        }

        this.currentIndex.set(clef, this.currentIndex.get(clef)+(n==1?this.beatsPerBar:this.beatNote/n));
    });
  }

  extendCanvasWidth(clef, canvasIndex, extendWidth){
    let orgWidth = this.canvasBox[clef][canvasIndex].canvas.width;
    this.canvasBox[clef][canvasIndex].canvas.setWidth(orgWidth+extendWidth);
    this.canvasBox[clef==0?1:0][canvasIndex].canvas.setWidth(orgWidth+extendWidth); 
  }

  clearChord(){
    this.lastTarget.chord = null;
    
    let grpObjects = this.lastTarget.getObjects();
    for(let k=0;k<grpObjects.length;k++){
      if(["chord"].indexOf(grpObjects[k].tag)>-1){
        this.lastTarget.remove(grpObjects[k]);
        this.lastTarget.lockMovementY = false;
      }
    } 
    this.refreshCanvas();
  }

  addChord(n){
      if(this.lastTarget!=null&&this.lastTarget.tag=='note'){
        let head = null;
        let left = 0
        let top = 0;
        if(this.lastTarget.pai==1){
          if(this.isUnderTurnAroundNoteKey()){
            if(n==1){left = 6; top = -13;}
            else if(n==2){left = -8; top = -20;}
            else if(n==3){left = -8; top = -27;}
            else if(n==4){left = -8; top = -34;}
            head = this.reddah.hollowHead(left,top,this.highlightColor);
            this.lastTarget.chord=[n];
          }else{
            if(n==1){left = -21; top = 1;}
            else if(n==2){left = -8; top = 8;}
            else if(n==3){left = -8; top = 15;}
            else if(n==4){left = -8; top = 22;}
            head = this.reddah.hollowHead(left,top,this.highlightColor);
            this.lastTarget.chord=[-n];
          }
        }else if(this.lastTarget.pai==1/2){
          if(this.isUnderTurnAroundNoteKey()){
            if(n==1){left = 6; top = -13;}
            else if(n==2){left = -8; top = -20;}
            else if(n==3){left = -8; top = -27;}
            else if(n==4){left = -8; top = -34;}
            head = this.reddah.hollowHead(left,top,this.highlightColor);
            this.lastTarget.chord=[n];
          }else{
            if(n==1){left = -23; top = 1;}
            else if(n==2){left = -8; top = 8;}
            else if(n==3){left = -8; top = 15;}
            else if(n==4){left = -8; top = 22;}
            head = this.reddah.hollowHead(left,top,this.highlightColor);
            this.lastTarget.chord=[-n];
          }
        }else if(this.lastTarget.pai==1/4){
          if(this.isUnderTurnAroundNoteKey()){
            if(n==1){left = 6; top = -13;}
            else if(n==2){left = -8; top = -20;}
            else if(n==3){left = -8; top = -27;}
            else if(n==4){left = -8; top = -34;}
            head = this.reddah.solidHead(left,top,this.highlightColor);
            this.lastTarget.chord=[n];
          }else{
            if(n==1){left = -25; top = 1;}
            else if(n==2){left = -8; top = 7;}
            else if(n==3){left = -8; top = 14;}
            else if(n==4){left = -8; top = 21;}
            head = this.reddah.solidHead(left,top,this.highlightColor);
            this.lastTarget.chord=[-n];
          }
        }else if(this.lastTarget.pai==1/8){
          console.log(8)
        }else if(this.lastTarget.pai==1/16){
          console.log(16)
        }else if(this.lastTarget.pai==1/32){
          console.log(32)
        }else if(this.lastTarget.pai==1/64){
          console.log(64)
        }
        head.tag='chord';
        this.lastTarget.add(head);
        this.lastTarget.lockMovementY = true;

        this.refreshCanvas();
      }
  }

  getNoteComponent(n){
    let component = [];
    if(n==1){
      component = [
        this.reddah.hollowHead(),
        this.reddah.stem('stemwhole',14,0,'transparent'),
        this.reddah.stem('stemwhole',0,50,'transparent')];

    }
    else if(n==2){
      component = [
        this.reddah.hollowHead(),
        this.reddah.stemUp(14)
        ,this.reddah.stemDown()];
    }
    else if(n==4){
      component = [
          this.reddah.solidHead(),
          this.reddah.stemUp(),
          this.reddah.stemDown()];
    }
    else if(n==8){
      component = [
          this.reddah.solidHead(),
          this.reddah.stemUp(),
          this.reddah.stemDown(),
          this.reddah.tailUp(1),
          this.reddah.tailDown(1),
        ];
    }
    else if(n==16)
    {
      component = [
        this.reddah.solidHead(),
        this.reddah.stemUp(),
        this.reddah.stemDown(),
        this.reddah.tailUp(2), 
        this.reddah.tailDown(2),
      ];
    }
    else if(n==32)
    {
      component = [
        this.reddah.solidHead(),
        this.reddah.stemUp(),
        this.reddah.stemDown(),
        this.reddah.tailUp(3), 
        this.reddah.tailDown(3),
      ];
    }
    else if(n==64)
    {
      component = [
        this.reddah.solidHead(),
        this.reddah.stemUp(),
        this.reddah.stemDown(),
        this.reddah.tailUp(4), 
        this.reddah.tailDown(4),
      ];
    }
    return component;
  }

  noteDistance = 60;
  addNote(n){
    this.checkAddBar(()=>{


        let defaultNoteKey = 'c4';

        let clef = this.currentClef;
        let canvasIndex = parseInt(this.currentIndex.get(clef)/this.beatsPerBar+"");
        let top = this.currentClef == 0 ?this.halfLineHeight*5 + this.topMargin:
          this.halfLineHeight*-7 + this.topMargin;
        let left = (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+
          (this.currentIndex.get(clef)%this.beatsPerBar)*this.noteDistance;
        
        
        let group = new fabric.Group(this.getNoteComponent(n),
        {
          left: left,
          top: top,
        })
        group.pai = 1/n;
        group.lockMovementX = true;
        group.lockRotation = true;
        group.hasBorders = false;
        group.hasControls = false;
        group.noteKey = defaultNoteKey;
        group.dot = 0;
        group.tag = 'note';
        group.noteIndex = this.reddah.nonce_str();
        this.canvasBox[clef][canvasIndex].canvas.add(group);
        this.setLastTarget(this.currentClef, group, canvasIndex);


        this.playNote(defaultNoteKey);

        this.clearAllUnderlines();
        this.resetNoteKeyAndUnderlines();

        this.currentIndex.set(clef, this.currentIndex.get(clef)+(this.beatNote/n));

    });
    
  }


  dot(){
    if(this.lastTarget!=null){
      let groupId = this.lastCanvasIndex + "_" + this.lastNoteIndex;

      let flag = true;
      let grpObjects = this.lastTarget.getObjects();
      for(let k=0;k<grpObjects.length;k++){
        if(["dot"].indexOf(grpObjects[k].tag)>-1){
          this.lastTarget.remove(grpObjects[k]);
          this.lastTarget.dot = 0;
          let n = 1/this.lastTarget.pai;
          this.currentIndex.set(this.currentClef, this.currentIndex.get(this.currentClef)-this.beatNote/n/2);
          flag = false;
        }
      }  
      
      if(flag){
        let isUnderTurnAroundNoteKey = this.isUnderTurnAroundNoteKey();
        this.lastTarget.add(this.reddah.dot(groupId, 1, this.lastTarget.pai, this.highlightColor));
        if(this.lastTarget.chord==1){
          //this.lastTarget.add(this.reddah.dot(groupId, 1, this.lastTarget.pai, this.highlightColor));
        }else if(this.lastTarget.chord==2){
          this.lastTarget.add(this.reddah.dot(groupId, 1, this.lastTarget.pai, this.highlightColor,
          8, 8+ (isUnderTurnAroundNoteKey ? -14:14)));
        }else if(this.lastTarget.chord==3){
          //this.lastTarget.add(this.reddah.dot(groupId, 1, this.lastTarget.pai, this.highlightColor));
        }else if(this.lastTarget.chord==4){
          this.lastTarget.add(this.reddah.dot(groupId, 1, this.lastTarget.pai, this.highlightColor,
          8, 8+(isUnderTurnAroundNoteKey ? -14:14)*2));
        }

        let n = 1/this.lastTarget.pai;
        this.currentIndex.set(this.currentClef, this.currentIndex.get(this.currentClef)+this.beatNote/n/2);
        this.lastTarget.dot = 1;
      }

      this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas.requestRenderAll();

    }
  }

  tie(){
    if(this.lastTarget!=null){

      let isUnderTurnAroundNoteKey = this.isUnderTurnAroundNoteKey();
      let offSetX = isUnderTurnAroundNoteKey?10:14;
      let offSetY = isUnderTurnAroundNoteKey?5:-28;
      let groupId = this.lastCanvasIndex + "_" + this.lastNoteIndex;

      if(this.lastTarget.tie!=null){
        let canvas1 = this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas;
        let grpObjects1 = canvas1.getObjects();
        for(let k=0;k<grpObjects1.length;k++){
          if(["tie"].indexOf(grpObjects1[k].tag)>-1){
            canvas1.remove(grpObjects1[k]);
          }
        } 
        let canvas2 = this.canvasBox[this.currentClef][this.lastCanvasIndex+1].canvas;
        let grpObjects2 = canvas2.getObjects();
        for(let k=0;k<grpObjects2.length;k++){
          if(["tie"].indexOf(grpObjects2[k].tag)>-1){
            canvas2.remove(grpObjects2[k]);
          }
        } 
        this.clearTieForBoth(canvas2);
        this.lastTarget.lockMovementY = false;
      }
      else{
        if(this.lastCanvasIndex<this.canvasBox[this.currentClef].length-1){
          let canvas1 = this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas;
          let canvas2 = this.canvasBox[this.currentClef][this.lastCanvasIndex+1].canvas;
          let note2 = this.getFirstNote(canvas2);
          let distance = note2.left + this.barWidth - this.lastTarget.left;
          console.log("#$"+distance)
          let tie1 = this.reddah.tie(distance, groupId, 1, this.lastTarget.pai, isUnderTurnAroundNoteKey);
          tie1.left =  this.lastTarget.left + offSetX;
          tie1.top = this.lastTarget.top + 8*this.halfLineHeight +offSetY;
          tie1.tag = 'tie';
          canvas1.add(tie1);
          canvas1.requestRenderAll();

          let tie2 = this.reddah.tie(distance, groupId, 1, this.lastTarget.pai, isUnderTurnAroundNoteKey);
          //tie2.left = this.lastTarget.left + offSetX - this.barWidth;
          
          tie2.left = note2.left + offSetX - distance;
          tie2.top = this.lastTarget.top + 8*this.halfLineHeight+offSetY;
          tie2.tag = 'tie';
          canvas2.add(tie2);
          canvas2.requestRenderAll();
          this.setTieForBoth(canvas2);
        }
        
        this.lastTarget.lockMovementY = true;
      }
    }
  }


  getFirstNote(canvas){
    let note = null;
    let objects = canvas.getObjects();
    for(let j = 0; j < objects.length; j++){
      if(objects[j].type=="group"&&objects[j].tag=='note')
      {
          note = objects[j];
          break;
      }
    }
    return note;
  }

  setTieForBoth(canvas){
    let objects = canvas.getObjects();
    for(let j = 0; j < objects.length; j++){
      if(objects[j].type=="group"&&objects[j].tag=='note')
      {
          this.lastTarget.tie = objects[j].pai * (objects[j].dot==1? 1.5:1);
          objects[j].tie = -1;
          break;
      }
    }
  }

  clearTieForBoth(canvas){
    let objects = canvas.getObjects();
    for(let j = 0; j < objects.length; j++){
      if(objects[j].type=="group"&&objects[j].tag=='note')
      {
          this.lastTarget.tie = null;
          objects[j].tie = null;
          break;
      }
    }
  }


  getHead(target){
      return new fabric.Rect({ 
          left: target.left, 
          top: target.top + this.halfLineHeight*6,
          width: target.width, 
          height: this.halfLineHeight*2
      });
  }

  tagNotTriggerChange = ['undefined','finger','pause'];
  tagNotTriggerPlayNote = ['undefined','rest','finger','pause'];
  onChange(clef, e, i) {
      e.target.setCoords();
      this.canvasBox[clef][i].canvas.forEachObject((obj)=> {     
        if (obj === e.target||this.tagNotTriggerChange.indexOf(e.target.tag)>-1) {
          return;
        }

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


  refreshCanvas(){
    let canvas = this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas;
    if(canvas){
      canvas.requestRenderAll();
    }
  }

  setLastTargetColor(target, color){
    let objects = target.canvas.getObjects();
    for(let j = 0; j < objects.length; j++){

      if(objects[j].type=="group"&&
          objects[j].noteIndex==target.noteIndex){
          let grpObjects = objects[j].getObjects();

          if(objects[j].tag=='rest'){
            for(let k=0;k<grpObjects.length;k++){
              grpObjects[k].set('fill', color);
            }
          }

          if(objects[j].tag=='note'){
            for(let k=0;k<grpObjects.length;k++){
              if(grpObjects[k].stroke!="transparent"){
                grpObjects[k].set('stroke', color);
              }
              if(grpObjects[k].fill!="transparent"){
                grpObjects[k].set('fill', color);
              }
            }
          }
      }
    }

    this.refreshCanvas();
  }

  setLastTarget(clef, target, canvasIndex){
    if(this.lastTarget!=null){
      this.setLastTargetColor(this.lastTarget, this.defaultColor);
    }

    this.currentClef = clef;
    this.lastTarget = target;
    this.lastCanvasIndex = canvasIndex;
    this.lastNoteIndex = target.noteIndex;

    this.setLastTargetColor(this.lastTarget, this.highlightColor);
  }

  setDefaultLastTarget(canvasIndex){
    let target;
    if(canvasIndex>=0){
      let objects = this.canvasBox[this.currentClef][canvasIndex].canvas.getObjects();
      for(let j = 0; j < objects.length; j++){
          if(objects[j].type=="group"){
            target = objects[j];
          }
      }

      this.lastCanvasIndex = canvasIndex;
      this.lastNoteIndex = target.noteIndex;
      this.lastTarget = target;

      this.setLastTargetColor(this.lastTarget, this.highlightColor);
    }
    else{
      this.clearLastTarget();
    }
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
      if (e.target) {
        if(e.target.type!="group"||this.tagNotTriggerChange.indexOf(e.target.tag)>-1) {
          return;
        }
        
        this.setLastTarget(clef, e.target, i);

        if(dir==1){//mousedown
          this.clearAllUnderlines();
        }
        if(dir==0){//mouseup
          e.target.setCoords();
          this.resetNoteKeyAndUnderlines();
        }
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
          if (obj === etarget || this.tagNotTriggerChange.indexOf(obj.tag)>-1) return;

          if(this.getHead(etarget).intersectsWithObject(obj)){
            if(obj.tag=='sub')
              obj.set('fill' , 'transparent');

            if(a==0)
              a = obj.id;
            else
              b = obj.id;
          }
        });
          
        console.log(a+"_"+b)

        if(etarget.type=='group'&&etarget.tag!='rest'){
          let groupId = i+"_"+etarget.noteIndex;
          if(a+"_"+b=="14_0"){
            etarget.noteKey = clef==0?'a6':'b4';
            
            etarget.add(this.reddah.uperLine(groupId, 1, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 2, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 3, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 4, etarget.pai));
            
            etarget.top = this.halfLineHeight*-7+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="13_14"){
            etarget.noteKey = clef==0?'g6':'a4';
            
            etarget.add(this.reddah.uperLine(groupId, 1.5, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 2.5, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 3.5, etarget.pai));
            
            etarget.top = this.halfLineHeight*-6+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="13_0"){
            etarget.noteKey = clef==0?'f6':'g4';
            
            etarget.add(this.reddah.uperLine(groupId, 1, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 2, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 3, etarget.pai));
            
            etarget.top = this.halfLineHeight*-5+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="12_13"){
            etarget.noteKey = clef==0?'e6':'f4';
            
            etarget.add(this.reddah.uperLine(groupId, 1.5, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 2.5, etarget.pai));
            
            etarget.top = this.halfLineHeight*-4+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="12_0"){
            etarget.noteKey = clef==0?'d6':'e4';
            
            etarget.add(this.reddah.uperLine(groupId, 1, etarget.pai));
            etarget.add(this.reddah.uperLine(groupId, 2, etarget.pai));
            
            etarget.top = this.halfLineHeight*-3+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="11_12"){
            etarget.noteKey = clef==0?'c6':'d4';
              
            etarget.add(this.reddah.uperLine(groupId, 1.5, etarget.pai));
            
            etarget.top = this.halfLineHeight*-2+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="11_0"){
            etarget.noteKey = clef==0?'b5':'c4';
            etarget.add(this.reddah.uperLine(groupId, 1, etarget.pai));
            
            etarget.top = this.halfLineHeight*-1+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="11_1"){
            etarget.noteKey = clef==0?'g5':'b3';
            etarget.top = this.halfLineHeight*0+this.topMargin - this.halfLineHeight*6;
          }


          else if(a+"_"+b=="1_0"){
            etarget.noteKey = clef==0?'f5':'a3';
            etarget.top = this.halfLineHeight*1+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="1_2"){
            etarget.noteKey = clef==0?'e5':'g3';
            etarget.top = this.halfLineHeight*2+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="2_0"){
            etarget.noteKey = clef==0?'d5':'f3';
            etarget.top = this.halfLineHeight*3+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="2_3"){
            etarget.noteKey = clef==0?'c5':'e3';
            etarget.top = this.halfLineHeight*4+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="3_0"){
            etarget.noteKey = clef==0?'b4':'d3';
            etarget.top = this.halfLineHeight*5+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="3_4"){
            etarget.noteKey = clef==0?'a4':'c3';
            etarget.top = this.halfLineHeight*6+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="4_0"){
            etarget.noteKey = clef==0?'g4':'b2';
            etarget.top = this.halfLineHeight*7+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="4_5"){
            etarget.noteKey = clef==0?'f4':'a2';
            etarget.top = this.halfLineHeight*8+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="5_0"){
            etarget.noteKey = clef==0?'e4':'g2';
            etarget.top = this.halfLineHeight*9+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="5_6"){
            etarget.noteKey = clef==0?'d4':'f2';
            etarget.top = this.halfLineHeight*10+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="6_0"){
            etarget.noteKey = clef==0?'c4':'e2';
            etarget.add(this.reddah.underLine(groupId, 1, etarget.pai));
            
            etarget.top = this.halfLineHeight*11+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="6_7"){
            etarget.noteKey = clef==0?'b3':'d2';
            etarget.add(this.reddah.underLine(groupId, 1.5, etarget.pai));
            
            etarget.top = this.halfLineHeight*12+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="7_0"){
            etarget.noteKey = clef==0?'a3':'c2';
            etarget.add(this.reddah.underLine(groupId, 1, etarget.pai));
            etarget.add(this.reddah.underLine(groupId, 2, etarget.pai));
            
            etarget.top = this.halfLineHeight*13+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="7_8"){
            etarget.noteKey = clef==0?'g3':'b1';
            etarget.add(this.reddah.underLine(groupId, 1.5, etarget.pai));
            etarget.add(this.reddah.underLine(groupId, 2.5, etarget.pai));
            
            etarget.top = this.halfLineHeight*14+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="8_0"){
            etarget.noteKey = clef==0?'f3':'a1';
            etarget.add(this.reddah.underLine(groupId, 1, etarget.pai));
            etarget.add(this.reddah.underLine(groupId, 2, etarget.pai));
            etarget.add(this.reddah.underLine(groupId, 3, etarget.pai));
            
            etarget.top = this.halfLineHeight*15+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="8_9"){
            etarget.noteKey = clef==0?'e3':'g1';
            etarget.add(this.reddah.underLine(groupId, 1.5, etarget.pai));
            etarget.add(this.reddah.underLine(groupId, 2.5, etarget.pai));
            etarget.add(this.reddah.underLine(groupId, 3.5, etarget.pai));
            
            etarget.top = this.halfLineHeight*16+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="9_0"){
            etarget.noteKey = clef==0?'d3':'f1';
            etarget.add(this.reddah.underLine(groupId, 1, etarget.pai));
            etarget.add(this.reddah.underLine(groupId, 2, etarget.pai));
            etarget.add(this.reddah.underLine(groupId, 3, etarget.pai));
            etarget.add(this.reddah.underLine(groupId, 4, etarget.pai));
            
            etarget.top = this.halfLineHeight*17+this.topMargin - this.halfLineHeight*6;
          }
        }
        
        this.setLastTargetColor(etarget, this.highlightColor);

        if(this.tagNotTriggerPlayNote.indexOf(etarget.tag+"")==-1){
          this.playNote(etarget.noteKey);
        }

        this.checkStemTailTurnAround();
        
    }

    isUnderTurnAroundNoteKey(){
      return this.keys88.indexOf(this.lastTarget.noteKey)<this.keys88.indexOf(this.currentClef==0?'b4':'d3')
    }

    checkStemTailTurnAround(){
      let isUnderTurnAroundNoteKey = this.isUnderTurnAroundNoteKey();
      let target = this.lastTarget;
      let i = this.lastCanvasIndex; 

      let objects = target.canvas.getObjects();
      for(let j = 0; j < objects.length; j++){
        if(objects[j].type=="group"&&
        objects[j].noteIndex==this.lastNoteIndex&&
        this.lastCanvasIndex==i){
          let grpObjects = objects[j].getObjects();
          for(let k=0;k<grpObjects.length;k++){
            if(["stemup","tailup"].indexOf(grpObjects[k].tag)>-1){
                grpObjects[k].set('stroke' , isUnderTurnAroundNoteKey? this.highlightColor:'transparent');
                grpObjects[k].set('fill' , isUnderTurnAroundNoteKey? this.highlightColor:'transparent');
            }
            if(["stemdown","taildown"].indexOf(grpObjects[k].tag)>-1){
                grpObjects[k].set('stroke' , isUnderTurnAroundNoteKey?'transparent':this.highlightColor);
                grpObjects[k].set('fill' , isUnderTurnAroundNoteKey?'transparent':this.highlightColor);
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

        if(this.playIndex==0){
          document.getElementById('playboard').scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth'
          });  
        }
        
        window.clearTimeout(this.time);
        this.playBars();
        if (this.isPlay) {
            if(this.playIndex%(this.beatsPerBar*2)==0){
              document.getElementById('playboard').scrollTo({
                  top: 0,
                  left: this.barWidth*this.playIndex/(this.beatsPerBar*2),
                  behavior: 'smooth'
              });
            }
            this.time = window.setTimeout(this.play, Math.floor(60000 / (this.speed*2)));
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

    playBars(){
      this.playBar(0);
      this.playBar(1);

      if(this.playIndex!=this.canvasBox[0].length*this.beatsPerBar*2-1){  
          this.playIndex++;
      }else{
          this.stop();
      }
    }


    playBar(clef){

      let canvasIndex = parseInt(this.playIndex/(this.beatsPerBar*2)+"");
      let playBeatIndex = parseInt(this.playIndex%(this.beatsPerBar*2)+"");

      let lastJump = this.currentJump.get(clef);
      let beatIndex = this.currentBeatIndex.get(clef);


      if(this.playIndex%(this.beatsPerBar*2)==0){
        this.currentBeatIndex.set(clef, 0);
        beatIndex = 0;
      }

      this.cursorAnimation(clef, canvasIndex, playBeatIndex);

      if(lastJump<=0)
      {
        let beat = this.getBeat(clef, canvasIndex, beatIndex);

        this.currentJump.set(clef, beat.last-1);

        this.playFrequency(beat);

        this.currentBeatIndex.set(clef, beatIndex+1);

      }else{
        console.log(clef+':not play')
        this.currentJump.set(clef, lastJump-1);
      }
    }

    playFrequency(beat){
      if(beat.frequency!=null){
        for(let i=0;i<beat.frequency.length;i++){
          this.createSound(beat.frequency[i], beat.last, beat.tie);
        }
      }
    }

    createSound1(freq, last, tie) {
      if(tie!=null&&tie<0)
        return;

      let singleBeatTime = Math.floor(60000 / this.speed)/1000;
      let duration = last*singleBeatTime;
      if(tie!=null&&tie>0){
        duration += tie*singleBeatTime;
      }
      let oscillator = this.audioCtx.createOscillator();
      let gainNode = this.audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      // sine|square|triangle|sawtooth
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      // 当前时间设置音量为0
      gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      // 0.01秒后音量为1
      gainNode.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + 0.01);
      // 音调从当前时间开始播放
      oscillator.start(this.audioCtx.currentTime);
      // this.opts.duration秒内声音慢慢降低，是个不错的停止声音的方法
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      // this.opts.duration秒后完全停止声音
      oscillator.stop(this.audioCtx.currentTime + duration);
    }

    createSound(freq, last, tie) {
      if(tie!=null&&tie<0)
        return;

      let singleBeatTime = Math.floor(60000 / this.speed)/1000;
      let duration = last*singleBeatTime;
      if(tie!=null&&tie>0){
        duration += tie*singleBeatTime;
      }
      this.soundPlay(freq, duration);
    }

    oscillator;
    gainNode;

    soundSetup() {
      this.oscillator = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();
  
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
      this.oscillator.type = 'sine';
    }
  
    soundPlay(value, duration) {
      this.soundSetup();
  
      this.oscillator.frequency.value = value;
      this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + 0.01);
              
      this.oscillator.start(this.audioCtx.currentTime);
      this.soundStop(this.audioCtx.currentTime, duration);
    }
    
    soundStop(currentTime, duration) {
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      this.oscillator.stop(this.audioCtx.currentTime + duration);
    }

    getBeat(clef, canvasIndex, beatIndex){
      let result = { 
        frequency: null, 
        last: 1/2,
        tie: 0,
      }
      if((canvasIndex>this.canvasBox[clef].length-1)||canvasIndex<0){
        return result;
      }
      if((beatIndex>(this.beatsPerBar*2))||beatIndex<0){
        return result;
      }
      
      let fValue = 'c4';
      let lValue = 1/2;
      let lDot = 0;
      let lAccidental = '';
      let lTie = null;
      let lChord = null;

      let flag = false;
      let count = 0;
      let box = this.canvasBox[clef][canvasIndex];
      let objects = box.canvas.getObjects();
      for(let j = 0; j < objects.length; j++){
        if(objects[j].type=="group"){
          //console.log(objects[j])
          if(count==beatIndex)
          {
              fValue = this.getNoteKeyByBar(objects[j].noteKey, clef, box.clef);
              lValue = objects[j].pai; 
              lDot = objects[j].dot; 
              lAccidental = objects[j].accidental;
              lTie = objects[j].tie;
              lChord = objects[j].chord;
              flag = true;
              break;
          }

          count++;
          
        }
      }

      if(flag==false){
        result.frequency = null;
        result.last = 1/2;
        result.tie = 0;
      }
      else{
        result.frequency = this.getFrequency(fValue, lAccidental, lChord);
        
        result.last = lValue/(1/(this.beatNote*2)) * (lDot==1? 1.5:1);
        
        if(lTie<0)
          result.tie  = -1;
        else
          result.tie = lTie/(1/(this.beatsPerBar*2));  //contains dot
      }

      console.log('clef:'+clef+' NoteKey:'+fValue+" Pai:"+lValue+" Last:"+result.last+" beatIndex:"+beatIndex)

      return result;
  }

  getNoteKeyByBar(noteKey, clef, barClef){
    if(barClef==null)
      return noteKey;

    if(clef!=(barClef?0:1)){
      let newNoteKey;
      //let keyBox = Array.from(this.reddah.f.keys());
      let keyBox = this.keys88.filter(k=>k.indexOf('#')==-1);
      let index = keyBox.indexOf(noteKey);
      if(barClef==true)
        newNoteKey = keyBox[index+12];
      else
        newNoteKey = keyBox[index-12];
      
      console.log(`oldkey:${noteKey} newkey:${newNoteKey}`)
      return newNoteKey;
    }  

  }

  getFrequency(fValue, lAccidental, lChord){
    if(lChord==null){
      if(this.keySignature!="C"){
        //G: [#],F: [b]
        let notesToChange = this.reddah.keySignature.get(this.keySignature);
        let keyBox = Array.from(this.reddah.f.keys());
        let index = keyBox.indexOf(fValue);
        notesToChange.forEach((item) => {
          if(fValue.indexOf(item.name)>-1&&fValue.indexOf('#')==-1)
          {
            if(item.accidental=="sharp"){//+1
              console.log("# old f:"+fValue)
              fValue = keyBox[index+1];
              console.log("# new f:"+fValue)
            }
            if(item.accidental=="flat"){//-1
              console.log("b old f:"+fValue)
              fValue = keyBox[index-1];
              console.log("b new f:"+fValue)
            }
          }
        });
      }
      if(lAccidental==null||lAccidental.length==0){
        return [this.reddah.f.get(fValue)];
      }
      else{
        let keyBox = Array.from(this.reddah.f.keys());
        let index = keyBox.indexOf(fValue);
        if(lAccidental=='sharp'&&index<keyBox.length){//#
          let newKey = keyBox[index+1];
          return [this.reddah.f.get(newKey)];
        }
        else if(lAccidental=='flat'&&index>0){//b
          let newKey = keyBox[index-1];
          return [this.reddah.f.get(newKey)];
        }
      }
    }
    else{//chord
      if(lAccidental==null||lAccidental.length==0){
        let result = [this.reddah.f.get(fValue)];
        let keyBox = Array.from(this.reddah.f.keys()).filter(a=>a.indexOf('#')==-1);
        let index = keyBox.indexOf(fValue);
        for(let i=0;i<lChord.length;i++){
          let newKey = keyBox[index+lChord[i]];
          result.push(this.reddah.f.get(newKey));
        }
        return result;
      }
      else{
        //todo
        let keyBox = Array.from(this.reddah.f.keys());
        let index = keyBox.indexOf(fValue);
        if(lAccidental=='sharp'&&index<keyBox.length){//#
          let newKey = keyBox[index+1];
          return [this.reddah.f.get(newKey)];
        }
        else if(lAccidental=='flat'&&index>0){//b
          let newKey = keyBox[index-1];
          return [this.reddah.f.get(newKey)];
        }
      }
    }
    
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


    clearFinger(){
      let canvas = this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas;

      if(this.lastTarget!=null){
        let tag = 'finger';
        
        let grpObjects = canvas.getObjects();
        for(let k=0;k<grpObjects.length;k++){
          if(grpObjects[k].tag===tag&&
            this.lastTarget.noteIndex==grpObjects[k].noteIndex){
            canvas.remove(grpObjects[k]);
          }
          this.lastTarget.finger = '';
        }  
      }
    }

    getFingerTop(tag){
      if(tag=='pause')
        return Math.min((this.lastTarget.top+20), this.topMargin-10);

      return this.currentClef==0 ?
        Math.min((this.lastTarget.top+20), this.topMargin-10) : 
        Math.max(this.topMargin + this.halfLineHeight*8 + 25, this.lastTarget.top+65);
    }

    setPause(){
      this.setMark('pause', '9');
    }

    setFinger(number){
      this.setMark('finger', number+'');
    }

    setMark(tag, number){
      let canvas = this.canvasBox[this.currentClef][this.lastCanvasIndex].canvas;

      if(this.lastTarget!=null){
        let groupId = this.lastCanvasIndex + "_" + this.lastNoteIndex;
        

        let flag = true;
        
        let grpObjects = canvas.getObjects();
        for(let k=0;k<grpObjects.length;k++){
          if(grpObjects[k].tag===tag&&
            this.lastTarget.noteIndex==grpObjects[k].noteIndex){
            canvas.remove(grpObjects[k]);
            flag = false;
          }
          this.lastTarget.finger = '';
        }  

        if((tag=='pause'&&flag===true)||tag=='finger'){
          let scaleX = (tag=='pause') ? 1 : .7;
          let scaleY = (tag=='pause') ? 1 : .7;
          let fingerLeft = tag=='pause' ? this.lastTarget.left-2:this.lastTarget.left+3
          
          let fingerGroup = new fabric.Group([
            this.reddah.finger(number, groupId, 1, this.lastTarget.pai, scaleX, scaleY)
          ],{
            left: fingerLeft,
            top: this.getFingerTop(tag)
          })
          
          if(tag=='pause')
            fingerGroup.lockMovementX = true;
          fingerGroup.lockRotation = true;
          fingerGroup.hasBorders = false;
          fingerGroup.hasControls = false;
          fingerGroup.noteIndex = this.lastTarget.noteIndex;
          fingerGroup.tag = tag;
          
          canvas.add(fingerGroup);
          this.lastTarget.finger = number;
        }

        canvas.requestRenderAll();
      }
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
          this.lastTarget.accidental = '';
        }  
        
        if(flag){
          this.lastTarget.add(this.reddah.accidental(tag, groupId, 1, this.lastTarget.pai, this.highlightColor));
          this.lastTarget.accidental = tag;
        }

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
