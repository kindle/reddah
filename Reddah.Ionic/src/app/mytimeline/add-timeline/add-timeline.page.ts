import { Component, OnInit, Input } from '@angular/core';
import { PopoverController, LoadingController, ModalController } from '@ionic/angular'
import { TimelinePopPage } from '../../common/timeline-pop.page';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ReddahService } from '../../reddah.service';
import { CacheService } from "ionic-cache";
import { LocalStorageService } from 'ngx-webstorage';
import { ImageViewerComponent } from '../../common/image-viewer/image-viewer.component';
import { DragulaService } from 'ng2-dragula';
import { LocationPage } from '../../common/location/location.page';
import { VideoEditor } from '@ionic-native/video-editor/ngx';
import { AtChooseUserPage } from 'src/app/chat/at-choose-user/at-choose-user.page';
import { TopicChoosePage } from 'src/app/chat/topic-choose/topic-choose.page';

@Component({
    selector: 'app-add-timeline',
    templateUrl: './add-timeline.page.html',
    styleUrls: ['./add-timeline.page.scss'],
})
export class AddTimelinePage implements OnInit {

    @Input() title;
    @Input() postType: number;
    @Input() article: any;
    //opt?'story'|'topic'
    @Input() action: any;


    //add for topic
    //timeline article type:1, 
    //topic article type:6
    //story article type: 11
    @Input() mini;

    constructor(
        private popoverController: PopoverController,
        public reddah: ReddahService,
        private loadingController: LoadingController,
        private cacheService: CacheService,
        private localStorageService: LocalStorageService,
        private modalController: ModalController,
        private dragulaService: DragulaService,
        private videoEditor: VideoEditor,
        private camera: Camera,
    ) { 
        this.dragulaService.drag('bag')
        .subscribe(({ name, el }) => {
            this.dragging = true;
        });

        this.dragulaService.dragend('bag')
        .subscribe(({ name, el }) => {
            this.removeClass(el, "ex-over");
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
                this.addClass(el, "ex-over");
            }
            else{
                this.dragToDel = false;
                this.removeClass(el, "ex-over");
            }
        });

        this.dragulaService.out('bag')
        .subscribe(({ el, container }) => {
            this.dragToDel = false;
            this.removeClass(el, "ex-over");
        });
    }

    private hasClass(el: Element, name: string): any {
        return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(el.className);
    }
    private addClass(el: Element, name: string): void {
        if (!this.hasClass(el, name)) {
            el.className = el.className ? [el.className, name].join(" ") : name;
        }
    }
    private removeClass(el: Element, name: string): void {
        if (this.hasClass(el, name)) {
            el.className = el.className.replace(
            new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"),
            ""
            );
        }
    }

    close(flag=false){
        this.modalController.dismiss(flag);
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
        else if(this.postType==3){//video from lib
            this.fromLibVideo();
        }
        else if(this.postType==4){//share from article
            //
        }
        else if(this.postType==5){//placeholder
            //
        }

        let draftThoughts = this.localStorageService.retrieve("Reddah_Mytimeline_Draft"+this.reddah.getCurrentUser());
        if(draftThoughts!=null){
            this.yourThoughts = draftThoughts;
        }
    }
    
    //photos = [{fileUrl: '1', webUrl:'web1'},{fileUrl: '2', webUrl:'web2'},{fileUrl: '3', webUrl:'web3'}];
    photos = [];
    photos_trash = [];
    dragging = false;
    dragToDel = false;
    yourThoughts: string = "";
    location;
    formData = new FormData();

    pressImage(){
        this.dragging = true;
    }

    pressUpImage(){
        this.dragging = false;
    }

    async saveDraft(){
        this.localStorageService.store("Reddah_Mytimeline_Draft"+this.reddah.getCurrentUser(),this.yourThoughts);
    }

    async submit(){

        if(this.action=="story"){
            if(this.location==null){
                this.reddah.toast("You should choose a location");
                return;
            }
        }

        const loading = await this.loadingController.create({
            message: this.reddah.instant("Article.Loading"),
            spinner: 'circles',
        });
        await loading.present();
        
        this.formData.append('thoughts', this.yourThoughts);
        this.formData.append('location', JSON.stringify(this.location));
        //send the key in UI display order
        this.formData.append('order', this.photos.map(e=>e.fileUrl).join(","));
        //feedback:9, normal:0, timeline:1, story:11
        this.formData.append('action', this.action);
        if(this.action=="story"){
            this.formData.append('type', JSON.stringify(11));
            this.formData.append('lat', this.location.location.lat);
            this.formData.append('lng', this.location.location.lng);
        }
        else if(this.action=="topic"){
            this.formData.append('type', JSON.stringify(6));
            if(this.mini==null){
                this.formData.append('abstract', this.topicChoose?this.topicChoose:"");
            }
            else{
                this.formData.append('abstract', this.mini.UserName);
            }
        }
        else{
            this.formData.append('type', JSON.stringify(1));
        }
        this.formData.append('feedbackType', JSON.stringify(-1));
        if(this.postType==4)//share
        {
            this.formData.append("abstract", this.reddah.htmlDecode(this.article.Title));
            if(this.article.ImageUrl==null||this.article.ImageUrl.length==0){
                this.formData.append("content", this.reddah.getFirstImage(this.article.Content));
            }
            else{
                this.formData.append("content", this.article.ImageUrl);
            }
            this.formData.append("ref", JSON.stringify(this.article.Id));
        }
        else{
            this.formData.append("ref", JSON.stringify(0));
        }
        this.formData.append("at", this.atUsers);
        //alert(this.photos.map(e=>e.fileUrl).join(","));

        this.reddah.addTimeline(this.formData)
        .subscribe(result => {
            loading.dismiss();
            if(result.Success==0)
            { 
                this.cacheService.clearGroup("MyTimeLinePage");
                this.localStorageService.clear("Reddah_mytimeline_"+this.reddah.getCurrentUser());
                this.localStorageService.clear("Reddah_mytimeline_ids_"+this.reddah.getCurrentUser());
                this.localStorageService.clear("Reddah_Mytimeline_Draft"+this.reddah.getCurrentUser());
                this.close(true);
            }
            else
            {
                alert(result.Message);
            }
        },
        error=>{
            alert(JSON.stringify(error));
        });
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
            //await this.takePhoto();
            await this.reddah.takePhoto(this.photos, this.formData);
        }
        else//from library
        {
            //await this.fromLibPhoto();
            await this.reddah.fromLibPhoto(this.photos, this.formData);
        }
    }
/*
    async takePhoto(){
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            correctOrientation: true
        }
          
        this.camera.getPicture(options).then((imageData) => {
            let data = {fileUrl: imageData, webUrl: (<any>window).Ionic.WebView.convertFileSrc(imageData)};
            this.photos.push(data);
            this.addPhotoToFormData(data);
        }, (err) => {
            //alert(JSON.stringify(err));
        });
        
    }
*/
    async fromLibVideo()
    {
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            mediaType: this.camera.MediaType.VIDEO,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
            correctOrientation: true
        }
          
        this.camera.getPicture(options).then((imageData) => {
            let fileUrl = "file://"+imageData;
            alert(fileUrl);

            //good
            this.videoEditor.getVideoInfo({
                fileUri: fileUrl
            })
            .then((info)=>{alert(JSON.stringify(info))})
            .catch((err)=>{alert(JSON.stringify(err))});

            this.videoEditor.trim({
                fileUri: fileUrl, // path to input video
                trimStart: 0, // time to start trimming in seconds
                trimEnd: 30, // time to end trimming in seconds
                outputFileName: 'output-name', // output file name
                progress: function(info) {} // optional, see docs on progress
            }).then((value)=>{alert(JSON.stringify(value))})
            .catch((err)=>{alert(JSON.stringify(err))});

            //good
            this.videoEditor.createThumbnail({
                fileUri: fileUrl,
                outputFileName: "cover",
                atTime: 2,
                quality: 50
            }).then((value)=>{alert(JSON.stringify(value))})
            .catch((err)=>{alert(JSON.stringify(err))})

            /*this.videoEditor.transcodeVideo({
                fileUri: "file://"+imageData,
                outputFileName: 'output.mp4',
                outputFileType: this.videoEditor.OutputFileType.MPEG4
            })
            .then((fileUri: string) => alert('video transcode success'+fileUri))
            .catch((error: any) => alert('video transcode error'+JSON.stringify(error)));*/
        }, (err) => {
            alert(JSON.stringify(err));
        });
        
    }
/*
    async fromLibPhoto()
    {
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
            correctOrientation: true
        }
          
        this.camera.getPicture(options).then((imageData) => {
            let data = {fileUrl: imageData, webUrl: (<any>window).Ionic.WebView.convertFileSrc(imageData)};
            this.photos.push(data);
            this.addPhotoToFormData(data);
        }, (err) => {
            //alert(JSON.stringify(err));
        });
        
    }

    addPhotoToFormData(photo){
        //append org photo form data
        this.prepareData(photo.fileUrl, photo.fileUrl);

        //append preview photo form data
        let orgFileName = photo.fileUrl.substring(photo.fileUrl.lastIndexOf('/')+1);
        let fileExtention = orgFileName.substring(orgFileName.lastIndexOf('.'));
        //remove ?****
        let removdQFileExtention = fileExtention.lastIndexOf('?')==-1 ? 
            fileExtention : fileExtention.replace(fileExtention.substring(fileExtention.lastIndexOf('?')),"");
        
        let previewFileName = orgFileName.replace(fileExtention,"") + "_reddah_preview" + removdQFileExtention;
        //alert(photo.fileUrl+"_"+previewFileName);
        let options = {
            uri: photo.fileUrl,
            folderName: 'reddah',
            fileName: previewFileName,
            quality: 40,
            width: 800,
            height: 800
        } as ImageResizerOptions;
        ImageResizer
            .resize(options)
            .then((filePath: string) => this.prepareData(filePath, photo.fileUrl+"_reddah_preview"))
            .catch(e => alert(e));
    }

    prepareData(filePath, formKey) {
        this.file.resolveLocalFilesystemUrl(filePath)
        .then(entry => {
            ( <FileEntry> entry).file(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    //org image data
                    const imgBlob = new Blob([reader.result], {
                        type: file.type
                    });
                    this.formData.append(formKey, imgBlob, file.name);
                };
                reader.readAsArrayBuffer(file);
            })
        })
        .catch(err => {
            console.error(JSON.stringify(err));
        });
    }
*/
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

    async getLocation(){
        const modal = await this.modalController.create({
            component: LocationPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
    
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.location = data;
        }
    }

    
    showFacePanel = false;
    toggleFacePanel(){
        this.showFacePanel = !this.showFacePanel;
    }
    faceSelection(face) {
        this.yourThoughts += face;
    }


    tap(event){
        //console.log(event)
        if(event.target.id!="faceIcon"&&
            event.target.id!="facePanel"&&
            event.target.id!="thoughtTxt")
            {
                this.showFacePanel = false;
            }
    }

    atUsers = "";
    topicChoose = "";
    async chooseAtUser(){
        const modal = await this.modalController.create({
            component: AtChooseUserPage,
            componentProps: { 
                article: this.article,
            },
            cssClass: "modal-fullscreen",
        });
            
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            let tempUsers = [];
            data.forEach((item)=>{
                this.yourThoughts += '@'+item.Watch;
                tempUsers.push(item.Watch);
            })
            this.atUsers = tempUsers.join(',');
        }
    }

    async chooseTags(){
        const modal = await this.modalController.create({
            component: TopicChoosePage,
            componentProps: { 
            },
            cssClass: "modal-fullscreen",
        });
            
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.topicChoose = data;
        }
    }

    chooseStock(){
        
    }
}
