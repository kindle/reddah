import { Component, OnInit, ViewChild } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Power4,Elastic,TweenMax } from "gsap";
import * as $ from 'jquery';

@Component({
    selector: 'app-magic-mirror',
    templateUrl: 'magic-mirror.page.html',
    styleUrls: ['magic-mirror.page.scss']
})
export class MagicMirrorPage implements OnInit {

    async close(){
        this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        public modalController: ModalController,

    ){ }

    

    async ngOnInit(){
        let photoCount = 6;
        let pieceCount = 6;
        let onPhoto = 0;
        let pieceCompleteCount = 0;
        let delay;

        let transitions = ['center', 'random']
        let transitionType = 0;

        for (let i = 0; i < photoCount; i++) {
            $('#preload').append('<img src="http://placekitten.com/500/' + (500 + i) + '">')
        };
        
        

        function setup() {
            $('#photo-holder').html('');
            for (let i = 0; i < pieceCount; i++) {
                let newWidth = (((100 - (100 / pieceCount) * i)) / 100) * 100; //((pieceWidth - ((pieceWidth / pieceCount) * i)) / pieceWidth) * 100;
                let newBackgroundSize = 100 + (100 - newWidth) / newWidth * 100; //100 + (100 - newWidth);
                let newTop = ((100 / pieceCount) * i) / 2;

                $('#photo-holder').append('<div class="section" id="piece' + i + '" style="top: ' + newTop + '%; left: ' + newTop + '%; width: ' + newWidth + '%; height: ' + newWidth + '%; background-size:' + newBackgroundSize + '%; background-image: url(\'http://placekitten.com/500/' + (500 + onPhoto) + '\')"></div>')
            };
            nextSlide(onPhoto);
        }

        function nextSlide(onPhoto) {
            clearInterval(delay);
            pieceCompleteCount = 0;
            ++onPhoto;
            if (onPhoto >= photoCount) {
                onPhoto = 0;
            }

            for (let i = 0; i < pieceCount; i++) {
                let spinDelay = 0;
                let spin = 360;
                let piece = $('#piece' + i);

                switch (transitions[transitionType]) {
                    case 'random':
                        spinDelay = Math.random() / 2;
                        spin = Math.random() * 360;
                        break;
                    case 'center':
                        spinDelay = (pieceCount - i) / 10;
                        spin = 181;
                        break;
                }

                TweenMax.to(piece, 1, {
                    delay: spinDelay,
                    directionalRotation: spin + '_long',
                    onComplete: completeRotation(piece, onPhoto),
                    onCompleteParams: [piece, onPhoto],
                    ease: Power4.easeIn
                })
            }
        }

        function completeRotation(piece, onPhoto) {
            piece.css('background-image', 'url(http://placekitten.com/500/' + (500 + onPhoto) + ')');
            TweenMax.to(piece, 2, {
                directionalRotation: '0_short',
                onComplete: ()=>{
                    ++pieceCompleteCount;
                    if (pieceCompleteCount == pieceCount) {
                        delay = setInterval(()=>nextSlide(onPhoto), 1000);
                    }
                },
                ease: Elastic.easeOut
            })
        }


        
        setup();
        

    }
    
}
