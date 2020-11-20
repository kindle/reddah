import { Component, OnInit } from '@angular/core';

import { fabric } from "fabric";
import * as tf from '@tensorflow/tfjs';
import { ReddahService } from '../reddah.service';


@Component({
  selector: 'app-tab5test',
  templateUrl: 'tab5test.page.html',
  styleUrls: ['tab5test.page.scss'],
})
export class Tab5TestPage implements OnInit{

  constructor(
    public reddah: ReddahService,
  ) {}

    fabric_canvas = [];

    ngOnInit(){
    }

    timer;

    ionViewDidEnter(){
        for(let i=1;i<=9;i++){
          this.result.push(null);
          let fabric_canvas = new fabric.Canvas('canvaspen'+i, {backgroundColor: "transparent"});
          fabric_canvas.renderTop();
          fabric_canvas.isDrawingMode = true;
          fabric_canvas.freeDrawingBrush.width = 12;
          fabric_canvas.freeDrawingBrush.color = "gray";
          
          //鼠标抬起事件
          fabric_canvas.on("mouse:up", (e)=> {
            window.clearTimeout(this.timer);

            this.timer = setTimeout(()=>{
                this.test(i);
             },1000);
          });
          this.fabric_canvas.push(fabric_canvas);

        }
    }

    reset(i){
        this.fabric_canvas[i-1].clear();
    }

    async test(i){
        var results = await this.predict('canvaspen'+i);
        console.log(results);
        let r = this.getMaxIndex(results);
        console.log(r)
        this.result[i-1] = (r==i);
        window.clearTimeout(this.timer);
    }

    getMaxIndex(arr) {
        var max = arr[0];
        var index = 0;
        for (var i = 0; i < arr.length; i++) {
            if (max < arr[i]) {
                max = arr[i];
                index = i;
            }
        }
        return index;
    }

    async predict(id) {
        var canvas = document.getElementById(id);
        var example = this.load_img(canvas);
        console.log(this.reddah.tfModel);
        const prediction = await this.reddah.tfModel.predict(example).data();
        var results = Array.from(prediction);
        return results
    }

    load_img(img) {
        var tensor = tf.browser.fromPixels(img)
            .resizeNearestNeighbor([28, 28])
            .mean(2)
            .expandDims()
            .toFloat()
            .div(255.0)
        return tensor;
    }

    result=[];
    getResult(i){
        return this.result[i];
    }

}