import { Component, OnInit } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LoadingController, NavController, ModalController } from '@ionic/angular';
import { Power4,Elastic,TweenMax } from "gsap";
import * as $ from 'jquery';

@Component({
    selector: 'app-magic-mirror',
    templateUrl: 'magic-mirror.page.html',
    styleUrls: ['magic-mirror.page.scss']
})
export class MagicMirrorPage implements OnInit {

    async close(){
        clearInterval(this.delay);
        this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        public modalController: ModalController,
    ){ }
    
    delay;
    photoCount = 6;
    pieceCount = 6;
    onPhoto = 0;
    pieceCompleteCount = 0;
    

    transitions = ['center', 'random']
    transitionType = 0;

    async ngOnInit(){
        for (let i = 0; i < this.photoCount; i++) {
            $('#preload').append('<img src="/assets/500/' + (500 + i) + '.jpeg">')
        };
        
        $('#photo-holder').html('');
        for (let i = 0; i < this.pieceCount; i++) {
            let newWidth = (((100 - (100 / this.pieceCount) * i)) / 100) * 100; 
            let newBackgroundSize = 100 + (100 - newWidth) / newWidth * 100; 
            let newTop = ((100 / this.pieceCount) * i) / 2;

            $('#photo-holder').append('<div class="section" id="piece' + i + '" style="top: ' + newTop + '%; left: ' + newTop + '%; width: ' + newWidth + '%; height: ' + newWidth + '%; background-size:' + newBackgroundSize + '%; background-image: url(\'/assets/500/' + (500 + this.onPhoto) + '.jpeg\')"></div>')
        };
        this.nextSlide();
    }

    nextSlide() {
        clearInterval(this.delay);
        this.pieceCompleteCount = 0;
        ++this.onPhoto;
        if (this.onPhoto >= this.photoCount) {
            this.onPhoto = 0;
        }

        for (let i = 0; i < this.pieceCount; i++) {
            let spinDelay = 0;
            let spin = 360;
            let piece = $('#piece' + i);

            switch (this.transitions[this.transitionType]) {
                case 'random':
                    spinDelay = Math.random() / 2;
                    spin = Math.random() * 360;
                    break;
                case 'center':
                    spinDelay = (this.pieceCount - i) / 10;
                    spin = 181;
                    break;
            }
console.log(1+"_"+piece+i);
            TweenMax.to(piece, 1, {
                delay: spinDelay,
                directionalRotation: spin + '_long',
                onComplete: this.completeRotation(piece),
                onCompleteParams: [piece],
                ease: Power4.easeIn
            })
        }
    }

    completeRotation(piece) {
        console.log(2+"_"+piece+this.onPhoto);
        piece.css('background-image', 'url(/assets/500/' + (500 + this.onPhoto) + '.jpeg)');
        TweenMax.to(piece, 2, {
            directionalRotation: '0_short',
            onComplete: this.test(),
            ease: Elastic.easeOut
        })
    }

    test(){
        console.log(3+"_"+this.pieceCompleteCount+"_"+this.pieceCount)
        ++this.pieceCompleteCount;
        if (this.pieceCompleteCount == this.pieceCount-1) {
            this.delay = setInterval(()=>this.nextSlide(), 1000);
        }
    }
    
}
