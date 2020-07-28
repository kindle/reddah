import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { MediaCapture, MediaFile, CaptureError,CaptureVideoOptions } from '@ionic-native/media-capture/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { Media } from '@ionic-native/media/ngx'; 
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
//import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer';
import { VideoEditor } from '@ionic-native/video-editor/ngx'
import { Capacitor } from '@capacitor/core';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit {

    @Input() selectedArticleId: number;
    @Input() selectedCommentId: number;
    @Output() reloadComments = new EventEmitter();
    @Output() localComments = new EventEmitter<any>();
    
    @ViewChild('newChatComment') newChatComment;
    
    speakDesc=this.reddah.instant('Pop.PressSpeak');
    commentContent: string;

    constructor(
        public reddah : ReddahService,
        private file: File,
        private media: Media,
        private platform: Platform,
        private videoEditor: VideoEditor,
        private camera: Camera,
        private mediaCapture: MediaCapture,
        //private imageResizer: ImageResizer,
    ) { }

    ngOnInit() {
    }
    
    showSpeakBox=false;
    switchSpeak(){
        this.showSpeakBox=!this.showSpeakBox;
        if(!this.showSpeakBox)
        {
            setTimeout(() => {
                this.newChatComment.setFocus();
            },150); 
        }
        else{
            this.showFacePanel = false;
            this.showFunctionPanel = false;
        }
    }

    async submit() {
        this.commentContent = "";
        let uid = this.reddah.uuidv4();
        this.localComments.emit({
            id: this.selectedArticleId, 
            text: this.newChatComment.value,
            type: 0,
            uid: uid,
        });
        this.reddah.addComments(
            this.selectedArticleId, 
            this.selectedCommentId, 
            this.newChatComment.value,
            uid
            )
        .subscribe(result => 
        {
            if(result.Success==0)
            { 
                this.reloadComments.emit();
                this.showFacePanel = false;
                this.showFunctionPanel = false;
            }
            else{
                alert(result.Message);
            }
        });
        
    }


    showFacePanel = false;
    toggleFacePanel(){
        this.showFunctionPanel = false;
        this.showFacePanel= !this.showFacePanel;
        if(this.showFacePanel){
            this.showSpeakBox = false;
        }
    }
    faceSelection(face) {
        this.newChatComment.value += face;
    }


    showFunctionPanel = false;
    toggleFunctionPanel(){
        this.showFacePanel = false;
        this.showFunctionPanel= !this.showFunctionPanel;
        if(this.showFacePanel){
            this.showSpeakBox = false;
        }
    }
    async funSelection(fun) {
        switch(fun){
            case 1: 
                await this.fromLib();
                break;
            case 2: 
                await this.takePhoto();
                break;
            case 3: 
                await this.fromVideoLib();
                break;
            case 4: 
                await this.takeVideo();
                break;
            default: 
                break;
        }
    }

    chatFunctionGroups = [
        [
            {id:1, icon:'images',name: this.reddah.instant('Pop.FunImageLib')}, //相册
            {id:2, icon:'camera',name:this.reddah.instant('Pop.FunCamera')}, //拍照片
            {id:3, icon:'play-circle',name:this.reddah.instant('Pop.FunVideoLib')}, //视频库
            {id:4, icon:'videocam',name:this.reddah.instant('Pop.FunVideo')}, //拍视频
            /*{id:5, icon:'pin',name:'位置'},
            {id:6, icon:'repeat',name:'转账'},
            {id:7, icon:'mic',name:'语音输入'},
            {id:8, icon:'cube',name:'我的收藏'}*/
        
        ],
        /*[
            {id:9, icon:'ios-person',name:'名片'},
            {id:10, icon:'folder',name:'文件'},
            {id:11, icon:'ios-wallet',name:'卡券'}           
            
        ]*/
    ];

    slideOpts = {
        centeredSlides: 'true',
        initialSlide: 0,
    };
    
    async hide(){
        this.showFunctionPanel = false;
        this.showFacePanel = false;
    }

    audioMediaObj;

    isPressed=false;
    async startSpeak(){
        this.isPressed=true;
        this.speakDesc = this.reddah.instant('Pop.ReleaseSend');
        if (this.reddah.isMobile()) {
            

    /*
            let fileName = this.reddah.generateFileName()+".m4a";
            this.file.createFile(this.file.tempDirectory, fileName, true).then(() => {
                this.audioMediaObj = this.media.create(this.file.tempDirectory.replace(/^file:\/\//, '') + fileName);
                this.audioMediaObj.startRecord();
                this.audioMediaObj.onSuccess.subscribe(() => {
                    this.uploadAudio(fileName);
                });
                this.audioMediaObj.onError.subscribe(err => {
                    alert('Record fail! Error: ' + err)
                });
            });

    */
            //let fileName = this.reddah.generateFileName()+".mp3";
            //let fileName = this.reddah.generateFileName()+".wav";
            let fileName = this.reddah.generateFileName()+".m4a";
            //let filePath = this.reddah.getDeviceDirectory().replace(/^file:\/\//, '') + "/reddah/" + fileName;
            let filePath = this.file.applicationStorageDirectory.replace(/^file:\/\//, '') + fileName;
            this.audioMediaObj = this.media.create(filePath);
            this.audioMediaObj.startRecord();
            this.audioMediaObj.onSuccess.subscribe(() => {
                this.uploadAudio(fileName);
            }); 
            this.audioMediaObj.onError.subscribe(err => {
                alert('Record fail! Error: ' + err)
            });
        }
    }


    async stopSpeak(){
        this.isPressed=false;
        this.speakDesc = this.reddah.instant('Pop.PressSpeak');
        if (this.reddah.isMobile()) {
            this.audioMediaObj.stopRecord();
        }
    }

    uploadAudio(fileName){
        let formData = new FormData();
        formData.append("ArticleId", JSON.stringify(this.selectedArticleId));
        formData.append("ParentCommentId", JSON.stringify(this.selectedCommentId));
        
        //let fullPath = this.reddah.getDeviceDirectory() +"reddah/"+ fileName;
        let fullPath = this.file.applicationStorageDirectory + fileName;
        
        let temp = this.media.create(fullPath);
        temp.play();
        temp.pause();
        setTimeout(() => {
            formData.append("Duration", JSON.stringify(parseInt(temp.getDuration().toString())));
            this.file.resolveLocalFilesystemUrl(fullPath)
            .then(entry => {
                (<FileEntry> entry).file(file => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const imgBlob = new Blob([reader.result], {
                            type: file.type
                        });
                        formData.append(file.name, imgBlob, file.name);
                        
                        this.reddah.addAudioChat(formData).subscribe(result => 
                        {
                            if(result.Success==0)
                            { 
                                //todo not work
                                this.reloadComments.emit();
                            }
                            else
                            {
                                alert(result.Message);
                            }
                            
                        },
                        error=>{
                            //console.error(JSON.stringify(error));
                            alert(JSON.stringify(error));
                        });
                    };
                    reader.readAsArrayBuffer(file);
                })
            })
            .catch(err => {
                console.error(JSON.stringify(err));
                alert(JSON.stringify(err));
            });
        }, 1000)
        temp.release();
    }


/*
    //not best plugin
    async startSpeak_B(){
        //limit audio 1 file, 60*5 seconds=5 minutes
        let options: CaptureAudioOptions = { limit: 1, duration: 60*5 };									
        MediaCapture.captureAudio(options).then(									
            (mediaFiles: MediaFile[]) => {
                this.uploadAudio_B(mediaFiles[0]);
            },									
            (err: CaptureError) => { 
                console.log('error:'+JSON.stringify(err))
                alert(JSON.stringify(err));
            }									
        );	
    }

    async uploadAudio_B(mediaFile){
        let formData = new FormData();
        formData.append("ArticleId", JSON.stringify(this.selectedArticleId));
        formData.append("ParentCommentId", JSON.stringify(this.selectedCommentId));

        this.file.resolveLocalFilesystemUrl(mediaFile.fullPath)
        .then(entry => {
            ( <FileEntry> entry).file(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const imgBlob = new Blob([reader.result], {
                        type: file.type
                    });
                    formData.append(mediaFile.name, imgBlob, file.name);
                    this.reddah.addAudioChat(formData).subscribe(result => 
                    {
                        
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
                    });
                };
                reader.readAsArrayBuffer(file);
            })
        })
        .catch(err => {
            console.error(JSON.stringify(err));
        });
    }
*/

    formData;

    async fromLib()
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
            let data = {fileUrl: imageData, webUrl: Capacitor.convertFileSrc(imageData)};
            this.addPhotoToFormData(data);
        }, (err) => {
            //console.log(JSON.stringify(err));
            //alert(JSON.stringify(err));
        });
        
    }

    async takePhoto(){
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            correctOrientation: true
        }
        
        this.camera.getPicture(options).then((imageData) => {
            let data = {fileUrl: imageData, webUrl: Capacitor.convertFileSrc(imageData)};
            this.addPhotoToFormData(data);
        }, (err) => {
            console.log(JSON.stringify(err));
        });

    }

    async fromVideoLib()
    {
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            mediaType: this.camera.MediaType.VIDEO,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
            correctOrientation: true
        }
        
        this.camera.getPicture(options).then((imageData) => {
            let data = {fileUrl: "file://"+imageData, webUrl: Capacitor.convertFileSrc(imageData)};
            //alert(JSON.stringify(data));
            this.addVideoToFormData(data);
        }, (err) => {
            console.log(JSON.stringify(err));
            alert(JSON.stringify(err));
        });
    }

    async takeVideo(){
        let options: CaptureVideoOptions = { limit: 1, duration: 60, quality: 100 };									
        this.mediaCapture.captureVideo(options).then(									
            (mediaFiles: MediaFile[]) => {
                //alert(JSON.stringify(mediaFiles));
                let data = {fileUrl: mediaFiles[0].fullPath, webUrl: Capacitor.convertFileSrc(mediaFiles[0].fullPath)};
                //alert(mediaFiles[0].fullPath);
                this.addVideoToFormData(data);
            },									
            (err: CaptureError) => { 
                console.log('error:'+JSON.stringify(err))
                alert(JSON.stringify(err));
            }
        );
    }

    addPhotoToFormData(photo)
    {
//alert(JSON.stringify(photo));
        this.formData = new FormData();
        //append org photo form data
        this.prepareData(photo.fileUrl, photo.fileUrl, 1, 2);

        //append preview photo form data
        let orgFileName = photo.fileUrl.substring(photo.fileUrl.lastIndexOf('/')+1);
        let fileExtention = orgFileName.substring(orgFileName.lastIndexOf('.'));
//alert(orgFileName+"--"+fileExtention);
        //remove ?****
        let removdQFileExtention = fileExtention.lastIndexOf('?')==-1 ? 
            fileExtention : fileExtention.replace(fileExtention.substring(fileExtention.lastIndexOf('?')),"");
        let previewFileName = orgFileName.replace(fileExtention,"") + "_reddah_preview" + removdQFileExtention;
//alert(photo.fileUrl+"_"+previewFileName+"_**_"+removdQFileExtention);
        //////
        /*let options = {
            uri: photo.fileUrl,
            folderName: 'reddah',
            fileName: previewFileName,
            quality: 40,
            width: 800,
            height: 800
        } as ImageResizerOptions;
        this.imageResizer
            .resize(options)
            .then((filePath: string) => this.prepareData(filePath, photo.fileUrl+"_reddah_preview", 2, 2))
            .catch(e => alert(e));*/
    }

    addVideoToFormData(data)
    {
        this.formData = new FormData();
        this.prepareData(data.fileUrl, data.fileUrl, 1, 3);
    }

    prepareVideoThumbnail(fileUrl, fileName){
        //create thumbnail image
        let posterName = fileName.toLowerCase().replace(".mp4", "");
        //alert(posterName);
        let option = {
            fileUri: fileUrl,
            outputFileName: posterName,
            atTime: 1,
            quality: 30
        }
        this.videoEditor.createThumbnail(option)
        .then(videoInfo=>{
            let posterFileUrl = "file://" + videoInfo;
            this.prepareData(posterFileUrl, posterFileUrl, 2, 3);
        })
        .catch(error=>{alert(JSON.stringify(error))})
    }

    // type: 0:text, 1:audio, 2:image, 3:video
    prepareData(filePath, formKey, step, type) {
//alert(filePath+"@@"+formKey);
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
            //alert(formKey+"_"+file.name);

                    if(type==3&&step==1){
                        this.prepareVideoThumbnail(filePath, file.name);
                    }
                    if(step==2){
                        setTimeout(() => {
                            this.submit_comment(type);
                        },1000)
                    }
                        
                };
                reader.readAsArrayBuffer(file);
            })
        })
        .catch(err => {
            //console.error
            alert("prepareData:"+JSON.stringify(err));
        });
    }

    // type: 0:text, 1:audio, 2:image, 3:video
    async submit_comment(type) {
        this.formData.append("ArticleId", JSON.stringify(this.selectedArticleId));
        this.formData.append("CommentId", JSON.stringify(this.selectedCommentId));
        this.formData.append("FileType", JSON.stringify(type));

        //this.localComments.emit({obj:this.formData});

        this.reddah.addPhotoComments(this.formData)
        .subscribe(result => 
        {
            if(result.Success==0)
            { 
                this.reloadComments.emit();
                this.showFacePanel = false;
                this.showFunctionPanel = false;
            }
            else{
                alert(result.Message);
            }
        });
        
    }


}
