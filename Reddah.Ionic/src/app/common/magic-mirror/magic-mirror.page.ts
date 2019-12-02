import { Component, OnInit, ViewChild } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import TweenMax from '../../../assets/js/TweenMax.min.js'

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
        private popoverController: PopoverController,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,

    ){
        
    }

    

    async ngOnInit(){
        let photoCount = 6;
        let pieceCount = 6;
        let onPhoto = 0;
        let pieceCompleteCount = 0;
        let delay;

        let transitions = ['center', 'random']
        let transitionType = 0;

        $(document).ready(function() {
            preload();
        });

        function preload() {
            for (var i = 0; i < photoCount; i++) {
                $('#preload').append('<img src="http://placekitten.com/500/' + (500 + i) + '">')
            };
            $(window).load(function() {
                setup();
            });
        }

        function setup() {
            $('#photo-holder').html('');
            for (var i = 0; i < pieceCount; i++) {
                var newWidth = (((100 - (100 / pieceCount) * i)) / 100) * 100; //((pieceWidth - ((pieceWidth / pieceCount) * i)) / pieceWidth) * 100;
                var newBackgroundSize = 100 + (100 - newWidth) / newWidth * 100; //100 + (100 - newWidth);
                var newTop = ((100 / pieceCount) * i) / 2;

                $('#photo-holder').append('<div class="section" id="piece' + i + '" style="top: ' + newTop + '%; left: ' + newTop + '%; width: ' + newWidth + '%; height: ' + newWidth + '%; background-size:' + newBackgroundSize + '%; background-image: url(\'http://placekitten.com/500/' + (500 + onPhoto) + '\')"></div>')
            };
            nextSlide();
        }

        function nextSlide() {
            clearInterval(delay);
            pieceCompleteCount = 0;
            ++onPhoto;
            if (onPhoto >= photoCount) {
                onPhoto = 0;
            }

            for (var i = 0; i < pieceCount; i++) {
                var spinDelay = 0;
                var spin = 360;
                var piece = $('#piece' + i);

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
                    onComplete: completeRotation,
                    onCompleteParams: [piece],
                    ease: Power4.easeIn
                })
            }
        }

        function completeRotation(piece) {
            piece.css('background-image', 'url(http://placekitten.com/500/' + (500 + onPhoto) + ')');
            TweenMax.to(piece, 2, {
                directionalRotation: '0_short',
                onComplete: finishPieceanimation,
                ease: Elastic.easeOut
            })
        }

        function finishPieceanimation() {
            ++pieceCompleteCount;
            if (pieceCompleteCount == pieceCount) {
                delay = setInterval(nextSlide, 1000);
            }
        }
    }
    
}
