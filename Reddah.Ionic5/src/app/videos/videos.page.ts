import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ReddahService } from '../reddah.service';
import { LoadingController, NavController, ModalController, IonSlides } from '@ionic/angular';

@Component({
    selector: 'app-videos',
    templateUrl: 'videos.page.html',
    styleUrls: ['videos.page.scss']
})
export class VideosPage implements OnInit {

    userName: any;
    videos = [];

    close(){
        this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        public modalController: ModalController, 
    ){
        this.userName = this.reddah.getCurrentUser();
        
        
    }

    slideOpts;

    ngOnInit(){
        this.videos.push({id:"video1", src:"assets/video/balloons.mp4", userName: "duowen"});
        this.videos.push({id:"video2", src:"assets/video/ref.mp4", userName: "zixian"});

        this.slideOpts = {
            pager: false,
            direction: 'vertical',
            centeredSlides: 'true',
            initialSlide: 0,
            zoom: true,
            spaceBetween: 0,
            effect: 'flip',
        };

    }

    toggleVideo(event){
        if(event.srcElement.paused)
            event.srcElement.play();
        else
            event.srcElement.pause();
    }


    @ViewChild(IonSlides) slides: IonSlides;
    lastElement;
    
    ionSlidesDidLoad(){
        if(this.videos.length>0){
            this.lastElement = document.getElementById(this.videos[0].id) as HTMLElement;
            this.lastElement.play();
        }
    }

    ionSlideWillChange(){
        this.slides.getActiveIndex().then(index=>
        {
            if(this.lastElement!=null){
                this.lastElement.pause();
                this.lastElement.currentTime = 0;
            }

            this.lastElement = document.getElementById(this.videos[index].id) as HTMLElement;
            this.lastElement.play();
        });
        
    }

    more(){
        
    }

}
