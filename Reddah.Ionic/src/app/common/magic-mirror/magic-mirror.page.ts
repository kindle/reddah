import { Component, OnInit, ViewChild } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
//import TweenMax from '../../../assets/js/TweenMax.min.js'
import { Power4,Elastic,TweenMax } from "gsap";

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

        
        for (var i = 0; i < photoCount; i++) {
            let image = new Image();
            image.src = `http://placekitten.com/500/` + (500 + i) 
            document.getElementById('preload').appendChild(image);
        };
        

        function setup() {
            document.getElementById('photo-holder').childNodes.forEach(item=>{
                this.removeChild(item);
            })
            for (var i = 0; i < pieceCount; i++) {
                var newWidth = (((100 - (100 / pieceCount) * i)) / 100) * 100; //((pieceWidth - ((pieceWidth / pieceCount) * i)) / pieceWidth) * 100;
                var newBackgroundSize = 100 + (100 - newWidth) / newWidth * 100; //100 + (100 - newWidth);
                var newTop = ((100 / pieceCount) * i) / 2;

                let divNode = document.createElement('div') as HTMLDivElement
                divNode.id = 'piece' + i;
                divNode.className = "section";
                divNode.style.setProperty("top", newTop+"%");
                divNode.style.setProperty("left", newTop+"%");
                divNode.style.setProperty("width", newWidth+"%");
                divNode.style.setProperty("height", newWidth+"%");
                divNode.style.setProperty("background-size", newBackgroundSize+"%");
                divNode.style.setProperty("background-image", "url('http://placekitten.com/500/'" + (500 + onPhoto)+")");

                document.getElementById('photo-holder').appendChild(divNode);

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
                let spinDelay = 0;
                let spin = 360;
                let piece = document.getElementById('piece' + i);

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


        setup();
    }
    
}
