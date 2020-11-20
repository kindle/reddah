import { Component, OnInit, Input } from '@angular/core';

import { fabric } from "fabric";
import * as tf from '@tensorflow/tfjs';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent implements OnInit {
    @Input() name: string;

    constructor(
        private reddah: ReddahService,
    ) { }

    fabric_canvas;

    ngOnInit(){    
        
    }

    ionViewDidEnter(){
        console.log(`canvaspen_${this.name}`)
        
    }

    resetPenCanvas(){
        this.fabric_canvas.clear();
        this.reddah.setTestPass();
    }

    async recognize(){
        var results = await this.predict(`canvaspen_${this.name}`);
        console.log(results);
        let r = this.getMaxIndex(results);
        console.log(r)
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
    };
      

}
