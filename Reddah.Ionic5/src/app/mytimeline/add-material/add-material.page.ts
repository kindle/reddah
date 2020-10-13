import { Component, OnInit, Input } from '@angular/core';
import { PopoverController, LoadingController, ModalController } from '@ionic/angular'
import { TimelinePopPage } from '../../common/timeline-pop.page';
import { ReddahService } from '../../reddah.service';
import { ImageViewerComponent } from '../../common/image-viewer/image-viewer.component';
import { DragulaService } from 'ng2-dragula';

@Component({
    selector: 'app-add-material',
    templateUrl: './add-material.page.html',
    styleUrls: ['./add-material.page.scss'],
})
export class AddMaterialPage implements OnInit {

    @Input() postType: number;
    @Input() article: any;

    constructor(
        private popoverController: PopoverController,
        public reddah: ReddahService,
        private loadingController: LoadingController,
        private modalController: ModalController,
        private dragulaService: DragulaService,
    ) { 
        this.dragulaService.drag('bag')
        .subscribe(({ name, el }) => {
            this.dragging = true;
        });

        this.dragulaService.dragend('bag')
        .subscribe(({ name, el }) => {
            this.reddah.removeClass(el, "ex-over");
            this.dragToDel = false;
            this.dragging = false;
        });
        this.dragulaService.dropModel('bag')
            .subscribe(({ el, target, source, sourceModel, targetModel, item }) => {
                if(target.id=="delete-photo"){
                    //delete org photo form data
                    this.formData.delete(item["fileUrl"]);
                    //delete resize photo form data
                    this.formData.delete(item["fileUrl"]+"_reddah_preview");
                }
        });
        
        if(!this.dragulaService.find('bag')){
            this.dragulaService.createGroup('bag', {
                removeOnSpill: false,
                revertOnSpill: true,
                moves: (el, container, handle) => {
                    // you can't move plus button
                    return handle.tagName !== "ION-ICON";
                },
                accepts: (el, target, source, sibling) => {
                    if (sibling === null) {
                        return false;
                    }
                    return true;
                },
            });
        }

        this.dragulaService.over('bag')
        .subscribe(({ el, container }) => {
            if(container.id=="delete-photo"){
                this.dragToDel = true;
                this.reddah.addClass(el, "ex-over");
            }
            else{
                this.dragToDel = false;
                this.reddah.removeClass(el, "ex-over");
            }
        });

        this.dragulaService.out('bag')
        .subscribe(({ el, container }) => {
            this.dragToDel = false;
            this.reddah.removeClass(el, "ex-over");
        });
    }

    

    close(){
        this.modalController.dismiss();
    }

    
    
    ngOnInit() {
        if(this.postType==1)//photo
        {
            //this.takePhoto();
            this.reddah.takePhoto(this.photos, this.formData);
        }
        else if(this.postType==2)//photo//from lib
        {
            //this.fromLibPhoto();
            this.reddah.fromLibPhoto(this.photos, this.formData);
        }
    }
    
    photos = [];
    photos_trash = [];
    dragging = false;
    dragToDel = false;
    yourThoughts: string = "";
    location = "";
    formData = new FormData();

    async submit(){
        const loading = await this.loadingController.create({
            cssClass: 'my-custom-class',
            spinner: null,
            duration: 30000,
            message: `<div class='bar-box'>${this.reddah.getLoadingEffect()}
            <div class='bar-text'>${this.reddah.instant("Article.Loading")}</div>
            </div>`,
            translucent: true,
            backdropDismiss: true
        });
        await loading.present();
        
        this.formData.append('thoughts', this.yourThoughts);
        this.formData.append('location', this.location);
        this.formData.append('feedbackType', JSON.stringify(-1));
        
        this.formData.append("ref", JSON.stringify(0));
        this.formData.append('type', JSON.stringify(5));//material:5, feedback:4, normal:0, timeline:1, chat:2,groupchat:3,
        //send the key in UI display order
        this.formData.append('order', this.photos.map(e=>e.fileUrl).join(","));        

        this.reddah.addTimeline(this.formData)
        .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0)
                { 
                    this.modalController.dismiss(true);
                }
                else
                {
                    alert(result.Message);
                }
                
            },
            error=>{
                //console.error(JSON.stringify(error));
                alert(JSON.stringify(error));
            }
        );
    }

    async addNewPhoto(ev: any) {
        const popover = await this.popoverController.create({
            component: TimelinePopPage,
            event: ev,
            translucent: true,
        });

        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data==1)//photo
        {
            await this.reddah.takePhoto(this.photos, this.formData);
        }
        else//from library
        {
            await this.reddah.fromLibPhoto(this.photos, this.formData);
        }
    }
    
    async viewer(index, imageSrcArray) {
        let newImageSrcArray = [];
        imageSrcArray.forEach((item)=>{
            newImageSrcArray.push(item.webUrl);
        });
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
                index: index,
                imgSourceArray: this.reddah.preImageArray(newImageSrcArray),
                imgTitle: "",
                imgDescription: ""
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true,
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
    
        return await modal.present();
    }
}
