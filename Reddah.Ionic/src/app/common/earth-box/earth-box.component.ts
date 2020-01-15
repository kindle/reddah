import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { TimelineMax, TweenMax, Power0, Power1 } from "gsap";
import * as $ from 'jquery';

@Component({
    selector: 'app-earth-box',
    templateUrl: './earth-box.component.html',
    styleUrls: ['./earth-box.component.scss']
})
export class EarthBoxComponent implements OnInit {

    @Input() test;
    constructor(
        public reddah : ReddahService,
    ) { 
        
    }

    ngOnInit() {
        var map = $('#map');
        var countries = $('.country');
        var shadows = $('.shadow');
        var locations = $('.location');
        var timeline = new TimelineMax();


        //IE FIX | START
        msieversion();

        function msieversion() {

                var ua = window.navigator.userAgent;
                var msie = ua.indexOf("MSIE ");

                if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
                    TweenMax.set(locations, {
                        y: 20,
                        transformOrigin: '50% 50%'
                    });
                } else {
                    TweenMax.set(locations, {
                        scale: 0,
                        y: 20,
                        transformOrigin: '50% 50%'
                    });
                }

                return false;
            }
            //IE FIX | END

        //TIMELINE | START
        timeline
            .to(
                map, 0.5, {
                    delay: 0.5,
                    left: '50%'
                }
            )
            .staggerTo(
                countries, 0.5, {
                    opacity: 1,
                    ease: Power0.easeNone
                }, 0.05
            )
            .staggerTo(
                shadows, 0.5, {
                    opacity: 1,
                    ease: Power1.easeInOut
                }, 0.05
            )
            .staggerTo(
                locations, 0.5, {
                    scale: 1,
                    y: 0,
                    opacity: 1,
                    ease: Power1.easeOut,
                    onComplete: tweenComplete,
                    onCompleteParams: ["{self}"]
                }, 0.25
            );

        function tweenComplete(tween) {
            TweenMax.to(tween.target, 0.5, {
                delay: 0.25,
                y: -5,
                yoyo: true,
                repeat: -1
            });
        }

    }



}
