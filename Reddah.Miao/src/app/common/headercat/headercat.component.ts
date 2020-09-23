import { Component, Input } from '@angular/core';
import { ModalController, PopoverController, Platform } from '@ionic/angular';
import { SearchPage } from '../search/search.page';
import { ReddahService } from '../../reddah.service';
import { AddTimelinePage } from 'src/app/mytimeline/add-timeline/add-timeline.page';
import { TimelinePopPage } from '../timeline-pop.page';

@Component({
    selector: 'app-headercat',
    templateUrl: './headercat.component.html',
    styleUrls: ['./headercat.component.scss']
})
export class HeaderCatComponent {

    @Input() htitle: string;
    @Input() back: boolean;

    constructor(
        private modalController: ModalController,
        private popoverController: PopoverController,
        private platform: Platform,
        public reddah: ReddahService,
    ) { 
    }

    async goSearch(key=''){
        const modal = await this.modalController.create({
            component: SearchPage,
            componentProps: { 
                key: key,
                //type: 0,//article only
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    async add(ev: any){
        const popover = await this.popoverController.create({
            component: TimelinePopPage,
            animated: false,
            translucent: true,
            cssClass: 'post-option-popover'
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data==1||data==2||data==3){
            //data=1: take a photo, data=2: lib photo, data=3: lib video
            this.goPost(data);
        }
    }
    
    
    async goPost(postType){
        const postModal = await this.modalController.create({
            component: AddTimelinePage,
            componentProps: { 
                postType: postType,
                action: 'topic',
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
            
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            //this.doRefresh(null);
        }
    }

    async close(){
        await this.modalController.dismiss();
    }

}
