import { Component, OnInit, Input } from '@angular/core';
import {fabric} from 'fabric'

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent implements OnInit {
  @Input() name: string;
  @Input() x;
  @Input() y;

  constructor() { }

  canvas;

  ngOnInit() {
    this.start();
  }

  ionViewDidEnter(){
    this.start();
  }

  start(){
    document.getElementById("c1").id= this.name;
    console.log(this.name);
    this.canvas = new fabric.Canvas(this.name);
    console.log(this.canvas)

    for(let i=1;i<=5;i++){
      let line = new fabric.Rect({ left: 0, top: 20*i, fill: '#000', width: 200, height: 2 });
      line.id="line"+i;
      line.selectable = false;
      this.canvas.add(line);
    }

    this.canvas.forEachObject((o)=>{ o.hasBorders = o.hasControls = false; });

    this.canvas.hoverCursor = 'pointer';
    this.canvas.on({
      'object:moving': (e)=>this.onChange(e),
      'object:scaling': (e)=>this.onChange(e),
      'object:rotating': (e)=>this.onChange(e),
      'mouse:down': (e)=> this.animate(e, 1),
      'mouse:up': (e)=> this.animate(e, 0)
    });
  }

  addNote(n){
    let color=n==1?"#000":"#0f0";
    let note = new fabric.Circle({ left: 50, top: 50, fill: color, radius:10 });
    note.lockMovementX = true;
    note.lockRotation = true;
    note.hasBorders = false;
    note.hasControls = false;
    this.canvas.add(note);
  }

  onChange(e) {
      e.target.setCoords();
      this.canvas.forEachObject((obj)=> {
        if (obj === e.target) return;
        if(e.target.intersectsWithObject(obj)){
          obj.set('opacity' , 0.5);
        }
        else{ 
          obj.set('opacity' , 1);
        }
        
      });
  }

  animate(e, dir) {
      if (e.target) {
        if(dir==0){//mouseup
          e.target.setCoords();
          this.canvas.forEachObject((obj)=> {
            if (obj === e.target) return;
            if(e.target.intersectsWithObject(obj)){
              console.log(obj.id);
            }
            
          });
        }

        fabric.util.animate({
          startValue: e.target.get('angle'),
          endValue: e.target.get('angle') + (dir ? 10 : -10),
          duration: 100,
          onChange: (value)=> {
            e.target._setOriginToCenter();
            this.canvas.renderAll();
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
            this.canvas.renderAll();
          },
          onComplete: ()=> {
            e.target.setCoords();
          }
        });
      }
    }

}
