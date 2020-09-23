import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { Article } from 'src/app/model/article';
import { PostviewerPage } from 'src/app/postviewer/postviewer.page';
import { AddTimelinePage } from 'src/app/mytimeline/add-timeline/add-timeline.page';
//import { mojs, easing, Timeline, Shape } from 'mo-js';
import * as mojs from 'mo-js';
import { VideosPage } from 'src/app/videos/videos.page';

//import * as mojs from "../../../assets/js/mo.min.js";

@Component({
    selector: 'app-find-action-bar',
    templateUrl: './find-action-bar.component.html',
    styleUrls: ['./find-action-bar.component.scss']
})
export class FindActionBarComponent {

    @Input() article;
    @Input() key;
    @Input() articles;

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
    ) { }

    

    extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
    }
    
    options;
    likeTopic(article, key, articles, ev){
        this.reddah.likeTopic(article, key, articles);

        var el14span = ev.srcElement;
        var el14 = el14span.parentElement;

        let tweens = [
            // ring animation
            new mojs.Shape({
                parent: el14,
                duration: 750,
                type: 'circle',
                radius: {0: 40},
                fill: 'transparent',
                stroke: '#F35186',
                strokeWidth: {35:0},
                opacity: 0.2,
                top: '45%',
                easing: mojs.easing.bezier(0, 1, 0.5, 1)
            }),
            new mojs.Shape({
                parent: el14,
                duration: 500,
                delay: 100,
                type: 'circle',
                radius: {0: 20},
                fill: 'transparent',
                stroke: '#F35186',
                strokeWidth: {5:0},
                opacity: 0.2,
                x : 40, 
                y : -60,
                easing: mojs.easing.sin.out
            }),
            new mojs.Shape({
                parent: el14,
                duration: 500,
                delay: 180,
                type: 'circle',
                radius: {0: 10},
                fill: 'transparent',
                stroke: '#F35186',
                strokeWidth: {5:0},
                opacity: 0.5,
                x: -10, 
                y: -80,
                isRunLess: true,
                easing: mojs.easing.sin.out
            }),
            new mojs.Shape({
                parent: el14,
                duration: 800,
                delay: 240,
                type: 'circle',
                radius: {0: 20},
                fill: 'transparent',
                stroke: '#F35186',
                strokeWidth: {5:0},
                opacity: 0.3,
                x: -70, 
                y: -10,
                easing: mojs.easing.sin.out
            }),
            new mojs.Shape({
                parent: el14,
                duration: 800,
                delay: 240,
                type: 'circle',
                radius: {0: 20},
                fill: 'transparent',
                stroke: '#F35186',
                strokeWidth: {5:0},
                opacity: 0.4,
                x: 80, 
                y: -50,
                easing: mojs.easing.sin.out
            }),
            new mojs.Shape({
                parent: el14,
                duration: 1000,
                delay: 300,
                type: 'circle',
                radius: {0: 15},
                fill: 'transparent',
                stroke: '#F35186',
                strokeWidth: {5:0},
                opacity: 0.2,
                x: 20, 
                y: -100,
                easing: mojs.easing.sin.out
            }),
            new mojs.Shape({
                parent: el14,
                duration: 600,
                delay: 330,
                type: 'circle',
                radius: {0: 25},
                fill: 'transparent',
                stroke: '#F35186',
                strokeWidth: {5:0},
                opacity: 0.4,
                x: -40, 
                y: -90,
                easing: mojs.easing.sin.out
            }),
            // icon scale animation
            new mojs.Tween({
                duration : 1200,
                easing: mojs.easing.ease.out,
                onUpdate: (progress)=> {
                    if(progress > 0.3) {
                        var elasticOutProgress = mojs.easing.elastic.out(1.43*progress-0.43);
                        el14span.style.WebkitTransform = el14span.style.transform = 'scale3d(' + elasticOutProgress + ',' + elasticOutProgress + ',1)';
                    }
                    else {
                        el14span.style.WebkitTransform = el14span.style.transform = 'scale3d(0,0,1)';
                    }
                }
            })
        ];

        this.options = this.extend( {}, this.options );
		this.extend( this.options, { tweens: tweens } );


        let timeline = new mojs.Timeline();

		for(var i = 0, len = tweens.length; i < len; ++i) {
			timeline.add(tweens[i]);
		}

        if( article.like) {
            timeline.replay();
        }
        else {
        }
			
    }

    async view(article: Article){
        if(article.Type==12){
            const modal = await this.modalController.create({
                component: VideosPage,
                componentProps: {
                    video: article
                },
                cssClass: "modal-fullscreen",
                swipeToClose: true,
                presentingElement: await this.modalController.getTop(),
            });
                
            await modal.present();
        }
        else{ 
            const viewerModal = await this.modalController.create({
                component: PostviewerPage,
                componentProps: { 
                    article: article,
                    isTopic: true
                },
                cssClass: "modal-fullscreen",
                swipeToClose: true,
                presentingElement: await this.modalController.getTop(),
            });
            
            await viewerModal.present();
            
            const { data } = await viewerModal.onDidDismiss();
            if(data||!data){   
                article.Read = true;
            }
        }
    }

    async forwardArticle(article){
        const postModal = await this.modalController.create({
            component: AddTimelinePage,
            componentProps: { 
                postType: 4,
                title: this.reddah.instant('Article.Forward'),
                article: article
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            this.reddah.fwdArticle(article);
            this.reddah.getSharePoint();
        }
    }


}
