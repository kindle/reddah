import { Component, OnInit, Input, NgZone } from '@angular/core';
import { PopoverController, LoadingController, ModalController } from '@ionic/angular'
import { TimelinePopPage } from '../../common/timeline-pop.page';
import { ReddahService } from '../../reddah.service';
import { ImageViewerComponent } from '../../common/image-viewer/image-viewer.component';
import { DragulaService } from 'ng2-dragula';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-add-feedback',
    templateUrl: './add-feedback.page.html',
    styleUrls: ['./add-feedback.page.scss'],
})
export class AddFeedbackPage implements OnInit {

    @Input() title: string;
    @Input() desc: string;
    @Input() postType: number;
    @Input() feedbackType = 1;

    @Input() article: any;
    @Input() userName;

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

    feedbackTypes =[
        { value:1, checked: false, text:this.reddah.instant("Pop.Suggest") },
        { value:2, checked: false, text:this.reddah.instant("Pop.ContentWrong") },
        { value:3, checked: false, text:this.reddah.instant("Pop.CodeError") },
        { value:4, checked: false, text:this.reddah.instant("Pop.ContentInvalid") },
        { value:5, checked: false, text:this.reddah.instant("Pop.ContentOther") },
    ]
    
    changeFeedbackType(item) {
        this.feedbackType = item.value;
        this.feedbackTypes.forEach((item,index)=>{
            if(item.value==this.feedbackType){
                item.checked = true;
            }
            else{
                item.checked = false;
            }
        })
    }
    
    ngOnInit() {
        if(this.feedbackType==6){
            this.feedbackTypes = [
                { value:6, checked: true, text:this.reddah.instant("Pop.Report") }
            ];
        }
        //4 article report abuse
        this.feedbackTypes.forEach((item,index)=>{
            if(item.value==this.feedbackType){
                item.checked = true;
            }
            if(item.value==4&&this.feedbackType!=4)
            {
                this.feedbackTypes.splice(index,1);
            }
        })
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
            message: this.reddah.instant("Article.Loading"),
            spinner: 'circles',
        });
        await loading.present();
        
        this.formData.append('thoughts', this.yourThoughts);
        this.formData.append('location', this.location);
        this.formData.append('feedbackType', JSON.stringify(this.feedbackType));
        if(this.feedbackType==4)//share
        {
            if(this.article.Type==0){
                this.formData.append("abstract", this.reddah.htmlDecode(this.article.Title));
                this.formData.append("content", this.article.ImageUrl);
                this.formData.append("ref", JSON.stringify(this.article.Id));
                this.formData.append("utype", 4+"");
            }
            else if(this.article.Type==3)
            {
                this.formData.append("abstract", this.reddah.htmlDecode(this.article.NickName+": "+this.article.Signature));
                this.formData.append("content", this.reddah.parseImage(this.article.Photo));
                this.formData.append("ref", this.article.UserId);
                this.formData.append("utype", 5+"");
            }
        }
        else if(this.feedbackType==6){//user report abuse
            this.formData.append("abstract", this.userName);
            this.formData.append("utype", 6+"");
            this.formData.append("ref", JSON.stringify(6));
        }
        else{
            this.formData.append("ref", JSON.stringify(0));
        }
        this.formData.append('type', JSON.stringify(4));//material:5, feedback:4, normal:0, timeline:1, chat:2,groupchat:3,
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
            showBackdrop: true
        });
    
        return await modal.present();
    }
}
