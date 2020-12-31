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

  canvasBox = [[],[]];

  keys88 = Array.from(this.reddah.f.keys());

  ngOnInit() {
    for(let i=0;i<8;i++){
        this.canvasBox[0].push({id:i, canvas: null, note: -100, sound: [0,0,0,0], json: null});
        this.canvasBox[1].push({id:i, canvas: null, note: -100, sound: [0,0,0,0], json: null});
    }
  }

  halfLineHeight = 7;
  topMargin = 60;

  ionViewDidEnter(){

    this.pai = 4;

    this.addStartCanvas(true,3,4);
    this.addStartCanvas(false,3,4);

    this.init(0);
    this.init(1);
  }

  init(clef){
    for(let i = 0;i<this.canvasBox[clef].length;i++)
    {
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
  
      this.canvasBox[clef][i].canvas.forEachObject((o)=>{ o.hasBorders = o.hasControls = false; });
  
      this.canvasBox[clef][i].canvas.hoverCursor = 'pointer';
      this.canvasBox[clef][i].canvas.on({
          'object:moving': (e)=>this.onChange(clef, e, i),
          'object:scaling': (e)=>this.onChange(clef, e, i),
          'object:rotating': (e)=>this.onChange(clef, e, i),
          'mouse:down': (e)=> this.animate(clef, e, 1, i),
          'mouse:up': (e)=> {this.animate(clef, e, 0, i);this.clef = clef}
      });



      //this.canvasBox[i].json = this.canvasBox[i].canvas.toJSON();
    }
  }

  clear(){
    this.clearClef(0);
    this.clearClef(1);
  }

  clearClef(clef){
    for(let i = 0;i<this.canvasBox.length;i++){
      let objects = this.canvasBox[clef][i].canvas.getObjects();
      for(let j = 0; j < objects.length; j++){
        //remove all but lines
        if(objects[j].id==null)    
          this.canvasBox[clef][i].canvas.remove(objects[j]);
      }
      this.canvasBox[clef][i].note = -100;
      this.canvasBox[clef][i].sound = [];
    }

    this.currentIndex.set(clef, 0);
    this.pai = 4;
    
    if(this.isPlay)
      this.stop();

    this.clearLastTarget()
  }


  clef = 0;
  addStartCanvas(flag, n1, n2){
    let startCanvas = new fabric.Canvas(flag?"startT":"startB");
    startCanvas.setWidth(100);
    startCanvas.setHeight(240);

    startCanvas.on({
      'mouse:up': (e)=> this.clef = flag? 0:1
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

  pai = 4;
  addNote(n){
    let color=n==1?"#000":"#0f0";
    
    let clef = this.clef;
    let canvasIndex = parseInt(this.currentIndex.get(clef)/this.pai+"");
    this.canvasBox[clef][canvasIndex].sound.push(9);

    //if(Array.from(this.reddah.rests.keys()).indexOf(n)>-1)
    if(n=='r64'){
      let group0 = new fabric.Group([this.reddah.rest(n)],{
        left: 15+(this.currentIndex.get(clef)%this.pai)*50,
        top: this.halfLineHeight*2 + this.topMargin,
        scaleY: 1,
        scaleX: 1
      })
      group0.lockMovementX = true;
      group0.lockMovementY = true;
      group0.lockRotation = true;
      group0.hasBorders = false;
      group0.hasControls = false;
      group0.noteKey = -100;
      group0.pai = n;
      group0.isWholeNote = true;
      group0.noteIndex = parseInt(this.currentIndex.get(clef)%this.pai+"");
      this.canvasBox[clef][canvasIndex].sound[group0.noteIndex] = -100;
      this.canvasBox[clef][canvasIndex].canvas.add(group0);
      this.setLastTarget(group0, canvasIndex);
    }
    else if(n=='r32'){
      let group0 = new fabric.Group([this.reddah.rest(n)],{
        left: 15+(this.currentIndex.get(clef)%this.pai)*50,
        top: this.halfLineHeight*2 + this.topMargin,
        scaleY: 1,
        scaleX: 1
      })
      group0.lockMovementX = true;
      group0.lockMovementY = true;
      group0.lockRotation = true;
      group0.hasBorders = false;
      group0.hasControls = false;
      group0.noteKey = -100;
      group0.pai = n;
      group0.isWholeNote = true;
      group0.noteIndex = parseInt(this.currentIndex.get(clef)%this.pai+"");
      this.canvasBox[clef][canvasIndex].sound[group0.noteIndex] = -100;
      this.canvasBox[clef][canvasIndex].canvas.add(group0);
      this.setLastTarget(group0, canvasIndex);
    }
    else if(n=='r16'){
      let group0 = new fabric.Group([this.reddah.rest(n)],{
        left: 15+(this.currentIndex.get(clef)%this.pai)*50,
        top: this.halfLineHeight*4 + this.topMargin,
        scaleY: 1.5,
        scaleX: 1.2
      })
      group0.lockMovementX = true;
      group0.lockMovementY = true;
      group0.lockRotation = true;
      group0.hasBorders = false;
      group0.hasControls = false;
      group0.noteKey = -100;
      group0.pai = n;
      group0.isWholeNote = true;
      group0.noteIndex = parseInt(this.currentIndex.get(clef)%this.pai+"");
      this.canvasBox[clef][canvasIndex].sound[group0.noteIndex] = -100;
      this.canvasBox[clef][canvasIndex].canvas.add(group0);
      this.setLastTarget(group0, canvasIndex);
    }
    else if(n=='r8'){
      let group0 = new fabric.Group([this.reddah.rest(n)],{
        left: 15+(this.currentIndex.get(clef)%this.pai)*50,
        top: this.halfLineHeight*4 + this.topMargin,
        scaleY: 1.5,
        scaleX: 1.2
      })
      group0.lockMovementX = true;
      group0.lockMovementY = true;
      group0.lockRotation = true;
      group0.hasBorders = false;
      group0.hasControls = false;
      group0.noteKey = -100;
      group0.pai = n;
      group0.isWholeNote = true;
      group0.noteIndex = parseInt(this.currentIndex.get(clef)%this.pai+"");
      this.canvasBox[clef][canvasIndex].sound[group0.noteIndex] = -100;
      this.canvasBox[clef][canvasIndex].canvas.add(group0);
      this.setLastTarget(group0, canvasIndex);
    }
    else if(n=='r4'){
      let group0 = new fabric.Group([this.reddah.rest(n)],{
        left: 15+(this.currentIndex.get(clef)%this.pai)*50,
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
      group0.pai = n;
      group0.isWholeNote = true;
      group0.noteIndex = parseInt(this.currentIndex.get(clef)%this.pai+"");
      this.canvasBox[clef][canvasIndex].sound[group0.noteIndex] = -100;
      this.canvasBox[clef][canvasIndex].canvas.add(group0);
      this.setLastTarget(group0, canvasIndex);
    }
    else if(n=='r2'){
      let group0 = new fabric.Group([this.reddah.rest(n)],{
        left: 15+(this.currentIndex.get(clef)%this.pai)*50,
        top: this.halfLineHeight*5 + this.topMargin,
        scaleY: 1.5,
        scaleX: 1.2
      })
      group0.lockMovementX = true;
      group0.lockMovementY = true;
      group0.lockRotation = true;
      group0.hasBorders = false;
      group0.hasControls = false;
      group0.noteKey = -100;
      group0.pai = n;
      group0.isWholeNote = true;
      group0.noteIndex = parseInt(this.currentIndex.get(clef)%this.pai+"");
      this.canvasBox[clef][canvasIndex].sound[group0.noteIndex] = -100;
      this.canvasBox[clef][canvasIndex].canvas.add(group0);
      this.setLastTarget(group0, canvasIndex);
    }
    else if(n=='r1'){
      let group0 = new fabric.Group([this.reddah.rest(n)],{
        left: this.canvasBox[clef][canvasIndex].canvas.width/2,
        top: this.halfLineHeight*4 + this.topMargin,
        scaleY: 1.5,
        scaleX: 1.2
      })
      group0.left = group0.left-group0.width/2;
      group0.lockMovementX = true;
      group0.lockMovementY = true;
      group0.lockRotation = true;
      group0.hasBorders = false;
      group0.hasControls = false;
      group0.noteKey = -100;
      group0.pai = n;
      group0.isWholeNote = true;
      group0.noteIndex = parseInt(this.currentIndex.get(clef)%this.pai+"");
      this.canvasBox[clef][canvasIndex].sound[group0.noteIndex] = -100;
      this.canvasBox[clef][canvasIndex].canvas.add(group0);
      this.setLastTarget(group0, canvasIndex);
    }
    else if(n==1){
      let group1 = new fabric.Group([
        this.reddah.hollowHead(),
        this.reddah.stem('stemwhole',11,0,'transparent'),
        this.reddah.stem('stemwhole',0,42,'transparent')],{
        left: 15+(this.currentIndex.get(clef)%this.pai)*50,
        top: this.halfLineHeight*4 + this.topMargin,
      })
      group1.lockMovementX = true;
      group1.lockRotation = true;
      group1.hasBorders = false;
      group1.hasControls = false;
      group1.noteKey = 'e4';
      group1.pai = n;
      group1.isWholeNote = true;
      group1.noteIndex = parseInt(this.currentIndex.get(clef)%this.pai+"");
      this.canvasBox[clef][canvasIndex].sound[group1.noteIndex] = 'e4';
      this.canvasBox[clef][canvasIndex].canvas.add(group1);
      this.setLastTarget(group1, canvasIndex);
    }
    else if(n==2){
      let group2 = new fabric.Group([
        this.reddah.hollowHead(),
        this.reddah.stemUp()
        ,this.reddah.stemDown()],{
        left: 15+(this.currentIndex.get(clef)%this.pai)*50,
        top: this.halfLineHeight*4 + this.topMargin,
      })
      group2.lockMovementX = true;
      group2.lockRotation = true;
      group2.hasBorders = false;
      group2.hasControls = false;
      group2.noteKey = 'e4';
      group2.pai = n;
      group2.noteIndex = parseInt(this.currentIndex.get(clef)%this.pai+"");
      this.canvasBox[clef][canvasIndex].sound[group2.noteIndex] = 'e4';
      this.canvasBox[clef][canvasIndex].canvas.add(group2);
      this.setLastTarget(group2, canvasIndex);
    }
    else if(n==4){
      let group4 = new fabric.Group([
          this.reddah.solidHead(),
          this.reddah.stemUp(),
          this.reddah.stemDown()],{
        left: 15+(this.currentIndex.get(clef)%this.pai)*50,
        top: this.halfLineHeight*4 + this.topMargin,
      })
      group4.lockMovementX = true;
      group4.lockRotation = true;
      group4.hasBorders = false;
      group4.hasControls = false;
      group4.noteKey = 'e4';
      group4.pai = n;
      group4.noteIndex = parseInt(this.currentIndex.get(clef)%this.pai+"");
      this.canvasBox[clef][canvasIndex].sound[group4.noteIndex] = 'e4';
      this.canvasBox[clef][canvasIndex].canvas.add(group4);
      this.setLastTarget(group4, canvasIndex);
    }
    else if(n==8){
      console.log(8)
      let group8 = new fabric.Group([
          this.reddah.solidHead(),
          this.reddah.stemUp(),
          this.reddah.stemDown(),
          this.reddah.tailUp(),
          this.reddah.tailDown(),
        ],{
        left: 15+(this.currentIndex.get(clef)%this.pai)*50,
        top: this.halfLineHeight*4 + this.topMargin,
      })
      group8.lockMovementX = true;
      group8.lockRotation = true;
      group8.hasBorders = false;
      group8.hasControls = false;
      group8.noteKey = 'e4';
      group8.pai = n;
      group8.noteIndex = parseInt(this.currentIndex.get(clef)%this.pai+"");
      this.canvasBox[clef][canvasIndex].sound[group8.noteIndex] = 'e4';
      this.canvasBox[clef][canvasIndex].canvas.add(group8);
      this.setLastTarget(group8, canvasIndex);
    }
    else if(n==16)
    {
      let group16 = new fabric.Group([
        this.reddah.solidHead(),
        this.reddah.stemUp(),
        this.reddah.stemDown(),
        this.reddah.twoTailsUp(), 
        this.reddah.twoTailsDown(),
      ],{
        left: 15+(this.currentIndex.get(clef)%this.pai)*50,
        top: this.halfLineHeight*4 + this.topMargin,
      })
      group16.lockMovementX = true;
      group16.lockRotation = true;
      group16.hasBorders = false;
      group16.hasControls = false;
      group16.noteKey = 'e4';
      group16.pai = n;
      group16.noteIndex = parseInt(this.currentIndex.get(clef)%this.pai+"");
      this.canvasBox[clef][canvasIndex].sound[group16.noteIndex] = 'e4';
      this.canvasBox[clef][canvasIndex].canvas.add(group16);
      this.setLastTarget(group16, canvasIndex);
    }
    this.playNote('e4');



    this.currentIndex.set(clef, this.currentIndex.get(clef)+1);



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

  setLastTarget(target, canvasIndex){
    this.lastTarget = target;
    this.lastCanvasIndex = canvasIndex;
    this.lastNoteIndex = target.noteIndex;
  }

  clearLastTarget(){
    this.lastCanvasIndex = null;
    this.lastNoteIndex = null;
    this.lastTarget = null;
  }

  lastCanvasIndex;
  lastNoteIndex;
  lastTarget;

  animate(clef, e, dir, i) {
      if (e.target) {
        if(e.target.type!="group") return;
        let groupId = i+"_"+e.target.noteIndex;
        this.lastCanvasIndex = i;
        this.lastNoteIndex = e.target.noteIndex;
        this.lastTarget = e.target;
        if(dir==1){//mousedown
          //remove all under lines
          let objects = e.target.canvas.getObjects();
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
        if(dir==0){//mouseup
          e.target.setCoords();
          
          let a=0,b=0;
          this.canvasBox[clef][i].canvas.forEachObject((obj)=> {
            if (obj === e.target) return;

            if(this.getHead(e.target).intersectsWithObject(obj)){
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
            e.target.noteKey = 'a6';
            this.canvasBox[clef][i].sound[e.target.noteIndex] = 'a6';
            if(e.target.type=='group'){
              let groupId = i+"_"+e.target.noteIndex;
              e.target.add(this.reddah.uperLine(groupId, 1, e.target.pai));
              e.target.add(this.reddah.uperLine(groupId, 2, e.target.pai));
              e.target.add(this.reddah.uperLine(groupId, 3, e.target.pai));
              e.target.add(this.reddah.uperLine(groupId, 4, e.target.pai));
            }
            e.target.top = this.halfLineHeight*-6+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="13_14"){
            e.target.noteKey = 'g6';
            this.canvasBox[clef][i].sound[e.target.noteIndex] = 'g6';
            if(e.target.type=='group'){
              let groupId = i+"_"+e.target.noteIndex;
              e.target.add(this.reddah.uperLine(groupId, 1.5, e.target.pai));
              e.target.add(this.reddah.uperLine(groupId, 2.5, e.target.pai));
              e.target.add(this.reddah.uperLine(groupId, 3.5, e.target.pai));
            }
            e.target.top = this.halfLineHeight*-5+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="13_0"){
            e.target.noteKey = 'f6';
            this.canvasBox[clef][i].sound[e.target.noteIndex] = 'f6';
            if(e.target.type=='group'){
              let groupId = i+"_"+e.target.noteIndex;
              e.target.add(this.reddah.uperLine(groupId, 1, e.target.pai));
              e.target.add(this.reddah.uperLine(groupId, 2, e.target.pai));
              e.target.add(this.reddah.uperLine(groupId, 3, e.target.pai));
            }
            e.target.top = this.halfLineHeight*-4+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="12_13"){
            e.target.noteKey = 'e6';
            this.canvasBox[clef][i].sound[e.target.noteIndex] = 'e6';
            if(e.target.type=='group'){
              let groupId = i+"_"+e.target.noteIndex;
              e.target.add(this.reddah.uperLine(groupId, 1.5, e.target.pai));
              e.target.add(this.reddah.uperLine(groupId, 2.5, e.target.pai));
            }
            e.target.top = this.halfLineHeight*-3+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="12_0"){
            e.target.noteKey = 'd6';
            this.canvasBox[clef][i].sound[e.target.noteIndex] = 'd6';
            if(e.target.type=='group'){
              let groupId = i+"_"+e.target.noteIndex;
              e.target.add(this.reddah.uperLine(groupId, 1, e.target.pai));
              e.target.add(this.reddah.uperLine(groupId, 2, e.target.pai));
            }
            e.target.top = this.halfLineHeight*-2+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="11_12"){
            e.target.noteKey = 'c6';
            this.canvasBox[clef][i].sound[e.target.noteIndex] = 'c6';
            if(e.target.type=='group'){
              let groupId = i+"_"+e.target.noteIndex;
              e.target.add(this.reddah.uperLine(groupId, 1.5, e.target.pai));
            }
            e.target.top = this.halfLineHeight*-1+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="11_0"){
            e.target.noteKey = 'b5';
            this.canvasBox[clef][i].sound[e.target.noteIndex] = 'b5';
            if(e.target.type=='group'){
              let groupId = i+"_"+e.target.noteIndex;
              e.target.add(this.reddah.uperLine(groupId, 1, e.target.pai));
            }
            e.target.top = this.halfLineHeight*0+this.topMargin - this.halfLineHeight*6;
          }
          else if(a+"_"+b=="11_1"){
            e.target.noteKey = 'g5';
            this.canvasBox[clef][i].sound[e.target.noteIndex] = 'g5';
            e.target.top = this.halfLineHeight*1+this.topMargin - this.halfLineHeight*6;
          }


          else if(a+"_"+b=="1_0"){
            e.target.noteKey = 'f5';
            this.canvasBox[clef][i].sound[e.target.noteIndex] = 'f5';
            e.target.top = this.halfLineHeight*2+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="1_2"){
            e.target.noteKey = 'e5';
            this.canvasBox[clef][i].sound[e.target.noteIndex] = 'e5';
            e.target.top = this.halfLineHeight*3+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="2_0"){
            e.target.noteKey = 'd5';
            this.canvasBox[clef][i].sound[e.target.noteIndex] = 'd5';
            e.target.top = this.halfLineHeight*4+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="2_3"){
            e.target.noteKey = 'c5';
            this.canvasBox[clef][i].sound[e.target.noteIndex] = 'c5';
            e.target.top = this.halfLineHeight*5+this.topMargin - this.halfLineHeight*6;
          }else if(a+"_"+b=="3_0"){
            e.target.noteKey = 'b4';
            this.canvasBox[clef][i].sound[e.target.noteIndex] = 'b4';
            e.target.top = this.halfLineHeight*6+this.topMargin - this.halfLineHeight*6;
          }
          else
          {
            if(a+"_"+b=="3_4"){
              e.target.noteKey = 'a4';
              this.canvasBox[clef][i].sound[e.target.noteIndex] = 'a4';
              e.target.top = this.halfLineHeight*7+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="4_0"){
              e.target.noteKey = 'g4';
              this.canvasBox[clef][i].sound[e.target.noteIndex] = 'g4';
              e.target.top = this.halfLineHeight*8+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="4_5"){
              e.target.noteKey = 'f4';
              this.canvasBox[clef][i].sound[e.target.noteIndex] = 'f4';
              e.target.top = this.halfLineHeight*9+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="5_0"){
              e.target.noteKey = 'e4';
              this.canvasBox[clef][i].sound[e.target.noteIndex] = 'e4';
              e.target.top = this.halfLineHeight*10+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="5_6"){
              e.target.noteKey = 'd4';
              this.canvasBox[clef][i].sound[e.target.noteIndex] = 'd4';
              e.target.top = this.halfLineHeight*11+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="6_0"){
              e.target.noteKey = 'c4';
              this.canvasBox[clef][i].sound[e.target.noteIndex] = 'c4';
              //add current under lines
              if(e.target.type=='group'){
                let groupId = i+"_"+e.target.noteIndex;
                e.target.add(this.reddah.underLine(groupId, 1, e.target.pai));
              }
              e.target.top = this.halfLineHeight*12+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="6_7"){
              e.target.noteKey = 'b3';
              this.canvasBox[clef][i].sound[e.target.noteIndex] = 'b3';
              //add current under lines
              if(e.target.type=='group'){
                let groupId = i+"_"+e.target.noteIndex;
                e.target.add(this.reddah.underLine(groupId, 1.5, e.target.pai));
              }
              e.target.top = this.halfLineHeight*13+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="7_0"){
              e.target.noteKey = 'a3';
              this.canvasBox[clef][i].sound[e.target.noteIndex] = 'a3';
              //add current under lines
              if(e.target.type=='group'){
                let groupId = i+"_"+e.target.noteIndex;
                e.target.add(this.reddah.underLine(groupId, 1, e.target.pai));
                e.target.add(this.reddah.underLine(groupId, 2, e.target.pai));
              }
              e.target.top = this.halfLineHeight*14+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="7_8"){
              e.target.noteKey = 'g3';
              this.canvasBox[clef][i].sound[e.target.noteIndex] = 'g3';
              //add current under lines
              if(e.target.type=='group'){
                let groupId = i+"_"+e.target.noteIndex;
                e.target.add(this.reddah.underLine(groupId, 1.5, e.target.pai));
                e.target.add(this.reddah.underLine(groupId, 2.5, e.target.pai));
              }
              e.target.top = this.halfLineHeight*15+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="8_0"){
              e.target.noteKey = 'f3';
              this.canvasBox[clef][i].sound[e.target.noteIndex] = 'f3';
              //add current under lines
              if(e.target.type=='group'){
                let groupId = i+"_"+e.target.noteIndex;
                e.target.add(this.reddah.underLine(groupId, 1, e.target.pai));
                e.target.add(this.reddah.underLine(groupId, 2, e.target.pai));
                e.target.add(this.reddah.underLine(groupId, 3, e.target.pai));
              }
              e.target.top = this.halfLineHeight*16+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="8_9"){
              e.target.noteKey = 'e3';
              this.canvasBox[clef][i].sound[e.target.noteIndex] = 'e3';
              //add current under lines
              if(e.target.type=='group'){
                let groupId = i+"_"+e.target.noteIndex;
                e.target.add(this.reddah.underLine(groupId, 1.5, e.target.pai));
                e.target.add(this.reddah.underLine(groupId, 2.5, e.target.pai));
                e.target.add(this.reddah.underLine(groupId, 3.5, e.target.pai));
              }
              e.target.top = this.halfLineHeight*17+this.topMargin - this.halfLineHeight*6;
            }else if(a+"_"+b=="9_0"){
              e.target.noteKey = 'd3';
              this.canvasBox[clef][i].sound[e.target.noteIndex] = 'd3';
              //add current under lines
              if(e.target.type=='group'){
                let groupId = i+"_"+e.target.noteIndex;
                e.target.add(this.reddah.underLine(groupId, 1, e.target.pai));
                e.target.add(this.reddah.underLine(groupId, 2, e.target.pai));
                e.target.add(this.reddah.underLine(groupId, 3, e.target.pai));
                e.target.add(this.reddah.underLine(groupId, 4, e.target.pai));
              }
              e.target.top = this.halfLineHeight*18+this.topMargin - this.halfLineHeight*6;
            }
          }

          this.playNote(e.target.noteKey);

          this.checkTurnAround();

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
        this.playKey(0);
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
    playKey(clef){
        let oscillator = this.audioCtx.createOscillator();
        let gainNode = this.audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        oscillator.type = 'sine';

        let canvasIndex = parseInt(this.i/this.pai+"");
        let noteIndex = parseInt(this.i%this.pai+"");
        oscillator.frequency.value = 
          this.getFrequency(clef, canvasIndex, noteIndex);

          console.log(oscillator.frequency.value)
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

    playNote(key){
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

    

    getFrequency(clef, cIndex, nIndex){
        if((cIndex>this.canvasBox.length-1)||cIndex<0)
          return 0;
        if((nIndex>this.canvasBox[clef][cIndex].sound.length-1)||nIndex<0)
          return 0;

        let value = this.canvasBox[clef][cIndex].sound[nIndex];
        if(value==-100){
          this.i=-1;
          return 0;
        }
        console.log(cIndex+"_"+nIndex+"_"+value)
        return this.reddah.f.get(value);
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

        this.canvasBox[this.clef][this.lastCanvasIndex].canvas.requestRenderAll();
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

        this.canvasBox[this.clef][this.lastCanvasIndex].canvas.requestRenderAll();

      }
    }

    move(flag){
      let keys = this.keys88.filter(k=>k.indexOf('#')==-1);
      console.log(keys)
      let newNoteKey = keys[keys.indexOf(this.lastTarget.noteKey)+flag];
      this.lastTarget.noteKey = newNoteKey;
      this.canvasBox[this.clef][this.lastCanvasIndex].sound[this.lastNoteIndex] = newNoteKey;
      this.lastTarget.top -= this.halfLineHeight*flag;
      
      //this.animate(this.clef, e, dir, this.lastCanvasIndex)
      this.checkTurnAround();

      this.playNote(this.lastTarget.noteKey);

      this.canvasBox[this.clef][this.lastCanvasIndex].canvas.requestRenderAll();
    }


    checkTurnAround(){
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
            if(["tailup","tail2up"].indexOf(grpObjects[k].tag)>-1){
                grpObjects[k].set('fill' , isUnderb4?'#000000':'transparent');
            }
            if(["stemdown"].indexOf(grpObjects[k].tag)>-1){
                grpObjects[k].set('stroke' , isUnderb4?'transparent':'#000000');
            }
            if(["taildown","tail2down"].indexOf(grpObjects[k].tag)>-1){
                grpObjects[k].set('fill' , isUnderb4?'transparent':'#000000');
            }
          }
          
        }
      }
    }
}
