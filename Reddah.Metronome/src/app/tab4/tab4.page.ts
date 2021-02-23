import { Component, OnInit, Input } from '@angular/core';
import { ReddahService } from '../reddah.service';
import { fabric } from 'fabric';
import { ActivatedRoute, Router } from '@angular/router';
import { MusicService } from '../music.service';

@Component({
    selector: 'app-tab4',
    templateUrl: './tab4.page.html',
    styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
    id;

    showGrid = false;
    startCanvasBox = [];
    canvasBox = [[],[]];

    beatsPerBar = 3;  //up
    beatNote = 4; //down
    keySignature = "C";

    defaultColor = 'black';
    highlightColor = 'red';

    currentClef = 0;
    keys88 = Array.from(this.reddah.f.keys());

    cursorColor = 'orange';
    countDownColor = '#3880ff';
    

    constructor(
        private router: Router,
        private activeRoute: ActivatedRoute,
        public reddah: ReddahService,
        private musicBox: MusicService,
        ) {
    }

    toJSON(canvas){
      return canvas.toJSON([
        'id','pai','noteIndex','noteKey','tag',
        'accidental','type','finger','pause',
        'chord','tie','rest','dot','underline',
        'number','time','key',
  
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
    //load key/time signaure
    this.updateKey(true);
    this.updateKey(false);
    this.updateTime(true);
    this.updateTime(false);

    
    for(let i=0;i<this.canvasBox[0].length;i++){
      let canvas0 = this.canvasBox[0][i].canvas;
      canvas0.loadFromJSON(this.music.canvas0[i], canvas0.renderAll.bind(canvas0));
      
      let canvas1 = this.canvasBox[1][i].canvas;
      canvas1.loadFromJSON(this.music.canvas1[i], canvas1.renderAll.bind(canvas1));
    
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
    showActionBarVisibility(clef, canvasIndex){
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
      this.activeRoute.queryParams.subscribe(params => {
        this.id = params['id'];
      });
    }

    barStartWidth = 140;
    barWidth = 240;
    halfLineHeight = 7;
    topMargin = 60;
    cursorInitLeft = 0;

    ionViewDidLeave(){
        if(this.isPlay!=0)
        {
          this.stop();
        }
        //clean up
        this.canvasBox = [[],[]];
    }

    readonly = true;
    music;
    ionViewDidEnter(){
        let musicJson = this.musicBox.songs.filter(m=>m.id==this.id)[0];

        this.music =  JSON.parse(musicJson.json);

        this.beatsPerBar = this.music.beatsPerBar;
        this.beatNote = this.music.beatNote;
        this.keySignature = this.music.keySignature?this.music.keySignature:"C";
        

        let barCount = this.music.canvas0.length;

        for(let i=0;i<barCount;i++){
            this.canvasBox[0].push({id:i, canvas: null, beats: [], json: null});
            this.canvasBox[1].push({id:i, canvas: null, beats: [], json: null});
        }

        setTimeout(() =>{

            this.addStartCanvas(true, this.beatsPerBar, this.beatNote);
            this.addStartCanvas(false, this.beatsPerBar, this.beatNote);
        
            this.init(0);
            this.init(1);
        
            this.addEndCanvas(true);
            this.addEndCanvas(false);
    
             this.load();
        }, 1)


    }
  
  
    addStartCanvas(flag, n1, n2){
      let canvas = new fabric.Canvas(flag?"startT":"startB");
      canvas.setWidth(this.barStartWidth);
      canvas.setHeight(240);
  
      canvas.on({
        'mouse:down': (e)=> this.showActionBarVisibility(this.currentClef, -1),
        'mouse:up': (e)=> this.currentClef = flag? 0:1
      });
  
      let frontLine = new fabric.Rect({ left: 0, top: this.topMargin+this.halfLineHeight*2, fill: '#000000', width: 1, height: this.halfLineHeight*8 });
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
      myGroup.lockMovemenY = true;
      myGroup.lockRotation = true;
      myGroup.hasBorders = false;
      myGroup.hasControls = false;
      myCanvas.add(myGroup);
    }
  
    init(clef){
      for(let i = 0;i<this.canvasBox[clef].length;i++)
      {
        if(this.canvasBox[clef][i].canvas==null){
          //console.log("init:"+clef+"_"+i)
          this.canvasBox[clef][i].canvas = new fabric.Canvas((clef==0?"t":"b")+this.canvasBox[clef][i].id);
          this.canvasBox[clef][i].canvas.setWidth(this.barWidth);
          this.canvasBox[clef][i].canvas.setHeight(240);
  
          if(i>0){
            let frontLine = new fabric.Rect({ left: 0, top: this.topMargin+this.halfLineHeight*2, fill: '#000000', width: 1, height: this.halfLineHeight*8 });
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
              objects[j].left = objects[j].left+50;
            }
  
            objects[j].set('stroke' , this.cursorColor);
            objects[j].set('fill' , this.cursorColor);
            
            this.canvasBox[clef][i].canvas.requestRenderAll();
            
            if(beatIndex==this.beatsPerBar-1){
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
  
    addBar(f) {
        let barId = this.canvasBox[0].length;
        this.canvasBox[0].push({id:barId, canvas: null, beats: [], json: null});
        this.canvasBox[1].push({id:barId, canvas: null, beats: [], json: null});
    
        setTimeout(() => {
          this.init(0);
          this.init(1);
        },1)
    }
  
    insertBar(canvasIndex) {
      let barId = this.canvasBox[0].length;
      
      this.canvasBox[0].splice(canvasIndex, 0, {id:barId, canvas: null, beats: [], json: null});
      this.canvasBox[1].splice(canvasIndex, 0, {id:barId, canvas: null, beats: [], json: null});
  
      this.addRest(1, this.currentClef, canvasIndex);
      //this.addRest(1, 1, canvasIndex);
  
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
      
      if(this.isPlay!=0)
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
      group0.tag = "rest"
      group0.noteIndex = this.reddah.nonce_str();
      
      this.canvasBox[this.currentClef][canvasIndex].canvas.add(group0);
      this.setLastTarget(this.currentClef, group0, canvasIndex);
    }
  
    noteOffsetx = 13;
    addRest(n, clef=null, canvasIndex=null){
      if(clef==null){
        clef = this.currentClef;
      }
      if(canvasIndex==null){
        canvasIndex = parseInt(this.currentIndex.get(clef)/this.beatsPerBar+"");
      }
      //console.log(clef+""+canvasIndex+this.currentIndex.get(clef));
  
      //this.canvasBox[clef][canvasIndex].sound.push(9);
      let p = 0;
      //if(Array.from(this.reddah.rests.keys()).indexOf(n)>-1)
      if(n=='r64'){
        p = 64;
        this.rest(p, canvasIndex,
          (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(clef)%this.beatsPerBar)*50, 
          this.halfLineHeight*2 + this.topMargin, 1, 1);
      }
      else if(n=='r32'){
        p = 32;
        this.rest(p, canvasIndex,
          (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(clef)%this.beatsPerBar)*50, 
          this.halfLineHeight*2 + this.topMargin, 1, 1);
      }
      else if(n=='r16'){
        p = 16;
        this.rest(p, canvasIndex,
          (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(clef)%this.beatsPerBar)*50, 
          this.halfLineHeight*4 + this.topMargin, 1.5, 1.2);
      }
      else if(n=='r8'){
        p = 8;
        this.rest(p, canvasIndex,
          (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(clef)%this.beatsPerBar)*50, 
          this.halfLineHeight*4 + this.topMargin, 1.5, 1.2);
      }
      else if(n=='r4'){
        p = 4;
        this.rest(p, canvasIndex,
          (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(this.currentClef)%this.beatsPerBar)*50, 
          this.halfLineHeight*3 + this.topMargin, 1.5, 1.2);
      }
      else if(n=='r2'){
        p = 2;
        this.rest(p, canvasIndex,
          (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(this.currentClef)%this.beatsPerBar)*50, 
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
  //console.log(this.currentIndex.get(clef) + "_"+ this.beatNote+"/"+p)
      this.currentIndex.set(clef, this.currentIndex.get(clef)+(p==1?this.beatsPerBar:this.beatNote/p));
  
    }
  
    extendCanvasWidth(clef, canvasIndex, extendWidth){
      let orgWidth = this.canvasBox[clef][canvasIndex].canvas.width;
      this.canvasBox[clef][canvasIndex].canvas.setWidth(orgWidth+extendWidth);
      this.canvasBox[clef==0?1:0][canvasIndex].canvas.setWidth(orgWidth+extendWidth); 
    }
  
    addNote(n){
      let color=n==1?"#000":"#0f0";
  
      let defaultNoteKey ='c4';
  
      let clef = this.currentClef;
      console.log("clefindex:"+this.currentIndex.get(clef)+"_beatsperbar:"+this.beatsPerBar)
      let canvasIndex = parseInt(this.currentIndex.get(clef)/this.beatsPerBar+"");
      
  
  
      if(n==1){
        let group1 = new fabric.Group([
          this.reddah.hollowHead(),
          this.reddah.stem('stemwhole',11,0,'transparent'),
          this.reddah.stem('stemwhole',0,42,'transparent')],{
          //left: this.canvasBox[clef][canvasIndex].canvas.width/2,
          left: (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(clef)%this.beatsPerBar)*50,
          top: this.halfLineHeight*6 + this.topMargin,
        })
  
        //group1.left = group1.left-group1.width/2;
        group1.lockMovementX = true;
        group1.lockRotation = true;
        group1.hasBorders = false;
        group1.hasControls = false;
        group1.noteKey = defaultNoteKey;
        group1.pai = 1;
        group1.dot = 0;
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
          left: (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(clef)%this.beatsPerBar)*50,
          top: this.halfLineHeight*6 + this.topMargin,
        })
        group2.left = group2.left-group2.width/2;
        group2.lockMovementX = true;
        group2.lockRotation = true;
        group2.hasBorders = false;
        group2.hasControls = false;
        group2.noteKey = defaultNoteKey;
        group2.pai = 1/2;
        group2.dot = 0;
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
          left: (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(clef)%this.beatsPerBar)*50,
          top: this.halfLineHeight*6 + this.topMargin,
        })
  
        console.log("4---"+this.currentIndex.get(clef)%this.beatsPerBar)
        group4.left = group4.left-group4.width/2;
        group4.lockMovementX = true;
        group4.lockRotation = true;
        group4.hasBorders = false;
        group4.hasControls = false;
        group4.noteKey = defaultNoteKey;
        group4.pai = 1/4;
        group4.dot = 0;
        group4.noteIndex = this.reddah.nonce_str();
        console.log("1/4:"+group4.noteIndex)
        //this.canvasBox[clef][canvasIndex].sound[group4.noteIndex] = defaultNoteKey;
        this.canvasBox[clef][canvasIndex].canvas.add(group4);
        this.setLastTarget(this.currentClef, group4, canvasIndex);
      }
      else if(n==8){
        let group8 = new fabric.Group([
            this.reddah.solidHead(),
            this.reddah.stemUp(),
            this.reddah.stemDown(),
            this.reddah.tailUp(1),
            this.reddah.tailDown(1),
          ],{
          left: (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(clef)%this.beatsPerBar)*50,
          top: this.halfLineHeight*6 + this.topMargin,
        })
        //this.extendCanvasWidth(clef, canvasIndex, 30);
        group8.lockMovementX = true;
        group8.lockRotation = true;
        group8.hasBorders = false;
        group8.hasControls = false;
        group8.noteKey = defaultNoteKey;
        group8.pai = 1/8;
        group8.dot = 0;
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
          left: this.barWidth/(this.beatsPerBar+1)+(this.currentIndex.get(clef)%this.beatsPerBar)*50,
          top: this.halfLineHeight*6 + this.topMargin,
        })
  
        //this.extendCanvasWidth(clef, canvasIndex, 20);
        group16.lockMovementX = true;
        group16.lockRotation = true;
        group16.hasBorders = false;
        group16.hasControls = false;
        group16.noteKey = defaultNoteKey;
        group16.pai = 1/16;
        group16.dot = 0;
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
          left: (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(clef)%this.beatsPerBar)*50,
          top: this.halfLineHeight*6 + this.topMargin,
        })
        group32.lockMovementX = true;
        group32.lockRotation = true;
        group32.hasBorders = false;
        group32.hasControls = false;
        group32.noteKey = defaultNoteKey;
        group32.pai = 1/32;
        group32.dot = 0;
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
          left: (this.barWidth/(this.beatsPerBar+1)-this.noteOffsetx)+(this.currentIndex.get(clef)%this.beatsPerBar)*50,
          top: this.halfLineHeight*6 + this.topMargin,
        })
        group64.lockMovementX = true;
        group64.lockRotation = true;
        group64.hasBorders = false;
        group64.hasControls = false;
        group64.noteKey = defaultNoteKey;
        group64.pai = 1/64;
        group64.dot = 0;
        group64.noteIndex = this.reddah.nonce_str();
        //this.canvasBox[clef][canvasIndex].sound[group64.noteIndex] = defaultNoteKey;
        this.canvasBox[clef][canvasIndex].canvas.add(group64);
        this.setLastTarget(this.currentClef, group64, canvasIndex);
      }
      this.playNote(defaultNoteKey);
  
      this.clearAllUnderlines();
      this.resetNoteKeyAndUnderlines();
  
      this.currentIndex.set(clef, this.currentIndex.get(clef)+(this.beatNote/n));
      //beatNote4 beatsPerBar3
      //beatNote4 beatsPerBar4
      
  
  
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
            etarget.noteKey = clef==0?'a6':'b4';
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
            etarget.noteKey = clef==0?'g6':'a4';
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
            etarget.noteKey = clef==0?'f6':'g4';
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
            etarget.noteKey = clef==0?'e6':'f4';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'e6';
            if(etarget.type=='group'){
              let groupId = i+"_"+etarget.noteIndex;
              etarget.add(this.reddah.uperLine(groupId, 1.5, etarget.pai));
              etarget.add(this.reddah.uperLine(groupId, 2.5, etarget.pai));
            }
            etarget.top = this.halfLineHeight*-3+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="12_0"){
            etarget.noteKey = clef==0?'d6':'e4';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'd6';
            if(etarget.type=='group'){
              let groupId = i+"_"+etarget.noteIndex;
              etarget.add(this.reddah.uperLine(groupId, 1, etarget.pai));
              etarget.add(this.reddah.uperLine(groupId, 2, etarget.pai));
            }
            etarget.top = this.halfLineHeight*-2+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="11_12"){
            etarget.noteKey = clef==0?'c6':'d4';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'c6';
            if(etarget.type=='group'){
              let groupId = i+"_"+etarget.noteIndex;
              etarget.add(this.reddah.uperLine(groupId, 1.5, etarget.pai));
            }
            etarget.top = this.halfLineHeight*-1+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="11_0"){
            etarget.noteKey = clef==0?'b5':'c4';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'b5';
            if(etarget.type=='group'){
              let groupId = i+"_"+etarget.noteIndex;
              etarget.add(this.reddah.uperLine(groupId, 1, etarget.pai));
            }
            etarget.top = this.halfLineHeight*0+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="11_1"){
            etarget.noteKey = clef==0?'g5':'b3';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'g5';
            etarget.top = this.halfLineHeight*1+this.topMargin - this.halfLineHeight*6;
          }
  
  
          else if(a+"_"+b=="1_0"){
            etarget.noteKey = clef==0?'f5':'a3';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'f5';
            etarget.top = this.halfLineHeight*2+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="1_2"){
            etarget.noteKey = clef==0?'e5':'g3';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'e5';
            etarget.top = this.halfLineHeight*3+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="2_0"){
            etarget.noteKey = clef==0?'d5':'f3';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'd5';
            etarget.top = this.halfLineHeight*4+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="2_3"){
            etarget.noteKey = clef==0?'c5':'e3';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'c5';
            etarget.top = this.halfLineHeight*5+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="3_0"){
            etarget.noteKey = clef==0?'b4':'d3';
            //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'b4';
            etarget.top = this.halfLineHeight*6+this.topMargin - this.halfLineHeight*6;
          }
          else
          {
            if(a+"_"+b=="3_4"){
              etarget.noteKey = clef==0?'a4':'c3';
              //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'a4';
              etarget.top = this.halfLineHeight*7+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="4_0"){
              etarget.noteKey = clef==0?'g4':'b2';
              //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'g4';
              etarget.top = this.halfLineHeight*8+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="4_5"){
              etarget.noteKey = clef==0?'f4':'a2';
              //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'f4';
              etarget.top = this.halfLineHeight*9+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="5_0"){
              etarget.noteKey = clef==0?'e4':'g2';
              //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'e4';
              etarget.top = this.halfLineHeight*10+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="5_6"){
              etarget.noteKey = clef==0?'d4':'f2';
              //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'd4';
              etarget.top = this.halfLineHeight*11+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="6_0"){
              etarget.noteKey = clef==0?'c4':'e2';
              //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'c4';
              //add current under lines
              if(etarget.type=='group'){
                let groupId = i+"_"+etarget.noteIndex;
                etarget.add(this.reddah.underLine(groupId, 1, etarget.pai));
              }
              etarget.top = this.halfLineHeight*12+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="6_7"){
              etarget.noteKey = clef==0?'b3':'d2';
              //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'b3';
              //add current under lines
              if(etarget.type=='group'){
                let groupId = i+"_"+etarget.noteIndex;
                etarget.add(this.reddah.underLine(groupId, 1.5, etarget.pai));
              }
              etarget.top = this.halfLineHeight*13+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="7_0"){
              etarget.noteKey = clef==0?'a3':'c2';
              //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'a3';
              //add current under lines
              if(etarget.type=='group'){
                let groupId = i+"_"+etarget.noteIndex;
                etarget.add(this.reddah.underLine(groupId, 1, etarget.pai));
                etarget.add(this.reddah.underLine(groupId, 2, etarget.pai));
              }
              etarget.top = this.halfLineHeight*14+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="7_8"){
              etarget.noteKey = clef==0?'g3':'b1';
              //this.canvasBox[clef][i].sound[etarget.noteIndex] = 'g3';
              //add current under lines
              if(etarget.type=='group'){
                let groupId = i+"_"+etarget.noteIndex;
                etarget.add(this.reddah.underLine(groupId, 1.5, etarget.pai));
                etarget.add(this.reddah.underLine(groupId, 2.5, etarget.pai));
              }
              etarget.top = this.halfLineHeight*15+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="8_0"){
              etarget.noteKey = clef==0?'f3':'a1';
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
              etarget.noteKey = clef==0?'e3':'g1';
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
              etarget.noteKey = clef==0?'d3':'f1';
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
  
  
      isUnderTurnAroundNoteKey(){
        return this.keys88.indexOf(this.lastTarget.noteKey)<this.keys88.indexOf(this.currentClef==0?'b4':'d3')
      }

      checkStemTailTurnAround(){
        let isUnderTurnAroundNoteKey = this.keys88.indexOf(this.lastTarget.noteKey)<this.keys88.indexOf(this.currentClef==0?'b4':'d3');
        let target = this.lastTarget;
        let i = this.lastCanvasIndex; 
  
        let objects = target.canvas.getObjects();
        for(let j = 0; j < objects.length; j++){
          if(objects[j].type=="group"&&objects[j].noteIndex==this.lastNoteIndex&&
          this.lastCanvasIndex==i){
            let grpObjects = objects[j].getObjects();
            for(let k=0;k<grpObjects.length;k++){
              if(["stemup"].indexOf(grpObjects[k].tag)>-1){
                  grpObjects[k].set('stroke' , isUnderTurnAroundNoteKey?'#000000':'transparent');
              }
              if(["tailup"].indexOf(grpObjects[k].tag)>-1){
                  grpObjects[k].set('fill' , isUnderTurnAroundNoteKey?'#000000':'transparent');
              }
              if(["stemdown"].indexOf(grpObjects[k].tag)>-1){
                  grpObjects[k].set('stroke' , isUnderTurnAroundNoteKey?'transparent':'#000000');
              }
              if(["taildown"].indexOf(grpObjects[k].tag)>-1){
                  grpObjects[k].set('fill' , isUnderTurnAroundNoteKey?'transparent':'#000000');
              }
            }
            
          }
        }
      }
  
      time;
      isPlay = 0;//0:not play 1:prepare 2:playing
      speed = 80;
  
     
  
      

      defaultAnimationCount = 2;
      COUNT = this.defaultAnimationCount;
      countTimer = null;

      playPrepare () {
        if(this.isPlay==0)
        {
          this.isPlay = 1;

          if(this.playIndex==0){
            document.getElementById('playboard').scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });  
          }

          let readybox = document.querySelector(".ready-box");
          let readyboxh1 = readybox.querySelector('h1');

          this.countTimer = setInterval(() => {
            this.COUNT--;
            readyboxh1.style.display = 'block';
            readyboxh1.style.zIndex = "1";
            if (this.COUNT >= 0) {
              readyboxh1.classList.remove('active');
              setTimeout(() => {
                readyboxh1.style.color = this.countDownColor;
                readyboxh1.classList.add('active');
              }, 100);
            } else {
              clearInterval(this.countTimer);
              readyboxh1.style.display = 'none';
              this.COUNT = this.defaultAnimationCount;

              this.play();
            }
          }, 1000);
        }
    }

    
    stop(){
      if(this.isPlay==1){
        this.playIndex=0;
        this.isPlay = 0;
        window.clearTimeout(this.countTimer);
        let readybox = document.querySelector(".ready-box");
        let readyboxh1 = readybox.querySelector('h1');
        readyboxh1.style.display = 'none';
        this.COUNT = this.defaultAnimationCount;
      }
      else if(this.isPlay==2){
        this.playIndex=0;
        this.isPlay = 0;
        window.clearTimeout(this.time);
        let stopCanvasIndex = parseInt(this.playIndex/this.beatsPerBar+"");
        this.cursorAnimation(0, stopCanvasIndex, this.beatsPerBar-1);
        this.cursorAnimation(1, stopCanvasIndex, this.beatsPerBar-1);
      }
    }

    play=()=>{
      this.isPlay = 2;
      
      if(this.playIndex==0){
        document.getElementById('playboard').scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });  
      }

      
      window.clearTimeout(this.time);
      this.playBars();
      if (this.isPlay==2) {
          
          if(this.playIndex%(this.beatsPerBar*2)==0){
            document.getElementById('playboard').scrollTo({
                top: 0,
                left: this.barWidth*this.playIndex/this.beatsPerBar,
                behavior: 'smooth'
            });
          }
          this.time = window.setTimeout(this.play, Math.floor(60000 / this.speed));
      };
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
  
        if(this.playIndex!=this.canvasBox[0].length*this.beatsPerBar-1){  
            this.playIndex++;
        }else{
            this.stop();
        }
      }
  
  
      playBar(clef){
        let canvasIndex = parseInt(this.playIndex/this.beatsPerBar+"");
        let playBeatIndex = parseInt(this.playIndex%this.beatsPerBar+"");
  
        let lastJump = this.currentJump.get(clef);
        let beatIndex = this.currentBeatIndex.get(clef);
  
  
        if(this.playIndex%this.beatsPerBar==0){
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
        last: 1,
        tie: 0,
      }
      if((canvasIndex>this.canvasBox[clef].length-1)||canvasIndex<0){
        return result;
      }
      if((beatIndex>this.beatsPerBar)||beatIndex<0){
        return result;
      }
      
      let fValue = 'c4';
      let lValue = 1;
      let lDot = 0;
      let lAccidental = '';
      let lTie = null;
      let lChord = null;

      let flag = false;
      let count = 0;
      let objects = this.canvasBox[clef][canvasIndex].canvas.getObjects();
      for(let j = 0; j < objects.length; j++){
        if(objects[j].type=="group"){
          if(count==beatIndex)
          {
              fValue = objects[j].noteKey;
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
        result.last = 1;
        result.tie = 0;
      }
      else{
        result.frequency = this.getFrequency(fValue, lAccidental, lChord);
        
        result.last = lValue/(1/this.beatsPerBar) * (lDot==1? 1.5:1);
        
        if(lTie<0)
          result.tie  = -1;
        else
          result.tie = lTie/(1/this.beatsPerBar);  //contains dot
      }

      console.log('NoteKey:'+fValue+" Last:"+lValue+" beatIndex:"+beatIndex)

      return result;
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
  
  
  
  
    async close() {
        this.router.navigate(['/tabs/tab3'], {}).then(()=>{
          //clean up
          this.canvasBox = [[],[]];
        });
    }

    createMetronome(){
        
    }

}
