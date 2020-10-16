import { Component, OnInit, Input, ViewEncapsulation, NgZone } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LoadingController, NavController, ActionSheetController, NavParams, AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Article } from 'src/app/model/article';

@Component({
    selector: 'app-read',
    templateUrl: 'read.page.html',
    styleUrls: ['read.page.scss'],
})
export class ReadPage implements OnInit {
    @Input() article: Article;
    
    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        public modalController: ModalController,
        public actionSheetController: ActionSheetController,
        public ngZone: NgZone,
    ){}


    synth = window.speechSynthesis;
    el;
    pgps;
    currIndex =0;
    fullText = "";
    playing = false;

    utterThis;
    ctp;



    ngOnInit(){
        setTimeout(() => {
            this.read();
        },2000)
    }


    read(){
        this.el = document.querySelector("#allstar");
        //this.pgps = this.el.querySelectorAll("p");
        this.pgps = this.el.querySelectorAll("div");
        console.log(this.pgps);

        this.pgps.forEach((p)=> {
            let ngRegex = / _ngcontent-...-c139=../ig; 
            let html = p.innerHTML.replace(ngRegex, "");
            p.innerHTML = "";
        
            html.split(" ").filter((w)=> {
                return w.trim().length;
            }).reduce((prev, curr)=> {
                console.log(curr)
                let br = (curr === "<br>");
                let elem = document.createElement(br ? "br" : "span");
        
                if (!br) {
                    elem.dataset.index = this.currIndex+"";
                    elem.innerHTML = curr;
                    let space = document.createElement("span");
                    space.textContent = " ";
                    prev.push(space);
                }
        
                prev.push(elem);
        
                this.fullText += curr.replace("<br>","") + " ";
                this.currIndex += elem.textContent.length + 1;
        
                return prev;
            }, []).forEach((span)=> {
                return p.appendChild(span);
            });
        });

        this.utterThis = new SpeechSynthesisUtterance(this.fullText);
        this.utterThis.lang = this.reddah.getCurrentLocale();


        this.ctp = document.querySelector(".ctp");
        this.utterThis.pitch = 1;
        this.utterThis.rate = 1;

        this.utterThis.onboundary = (event)=> {
            console.log(event.charIndex)
            let index = event.charIndex;
        
            let el = document.querySelector("[data-index='" + index + "']");
            if (el) {
                console.log(el)
                let els = document.querySelectorAll("[data-index]");
                els.forEach((e)=> {
                    return e.classList.remove("current");
                });
                el.classList.add("current");
                
            }
        };

        if (!this.playing) {
            this.ctp.classList.add("ctp--hidden");
            this.synth.speak(this.utterThis);
            this.playing = true;
            return;
        }
    
        this.ctp.classList.remove("ctp--hidden");
        this.synth.cancel();
        this.playing = false;
        let els = document.querySelectorAll("[data-index]");
        els.forEach((e)=> {
            return e.classList.remove("current");
        });
    }

    close(){
        this.modalController.dismiss();
    }

    ionViewDidLeave(){
        this.synth.cancel();
    }










}
