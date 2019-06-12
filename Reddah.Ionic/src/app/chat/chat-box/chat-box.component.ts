import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { CacheService } from "ionic-cache";
import { MediaCapture, MediaFile, CaptureError, CaptureAudioOptions } from '@ionic-native/media-capture';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx'; 

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit {

    @Input() selectedArticleId: number;
    @Input() selectedCommentId: number;
    @Output() reloadComments = new EventEmitter();
    @ViewChild('newChatComment') newChatComment;
    
    speakDesc="按住 说话";
    commentContent: string;

    constructor(
        public reddah : ReddahService,
        private cacheService: CacheService,
        private modalController: ModalController,
        private file: File,
        private media: Media,
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
        this.reddah.addComments(this.selectedArticleId, this.selectedCommentId, this.newChatComment.value)
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
    funSelection(fun) {
        //this.newChatComment.value += fun;
    }

    chatFunctionGroups = [
        [
            {id:1, icon:'images',name:'相册'},
            {id:2, icon:'camera',name:'拍摄'},
            {id:3, icon:'videocam',name:'视频通话'},
            {id:4, icon:'pin',name:'位置'},
            {id:5, icon:'gift',name:'红包'},
            {id:6, icon:'repeat',name:'转账'},
            {id:7, icon:'mic',name:'语音输入'},
            {id:8, icon:'cube',name:'我的收藏'}
        
        ],
        [
            {id:9, icon:'ios-person',name:'名片'},
            {id:10, icon:'folder',name:'文件'},
            {id:11, icon:'ios-wallet',name:'卡券'}           
            
        ]
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

    async startSpeak(){
        this.speakDesc = "松开 发送";

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
        //let fileName = this.reddah.generateFileName()+".wav";
        let fileName = this.reddah.generateFileName()+".m4a";
        let filePath = this.file.externalRootDirectory.replace(/^file:\/\//, '') + "/reddah/" + fileName;
        this.audioMediaObj = this.media.create(filePath);
        this.audioMediaObj.startRecord();
        this.audioMediaObj.onSuccess.subscribe(() => {
            this.uploadAudio(fileName);
        }); 
        this.audioMediaObj.onError.subscribe(err => {
            alert('Record fail! Error: ' + err)
        });
    }


    async stopSpeak(){
        this.speakDesc = "按住 说话";
        this.audioMediaObj.stopRecord();
    }

    uploadAudio(fileName){
        let formData = new FormData();
        formData.append("ArticleId", JSON.stringify(this.selectedArticleId));
        formData.append("ParentCommentId", JSON.stringify(this.selectedCommentId));
        
        let fullPath = this.file.externalRootDirectory +"/reddah/"+ fileName;
        
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

}
