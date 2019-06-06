import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { CacheService } from "ionic-cache";

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

    constructor(
        public reddah : ReddahService,
        private cacheService: CacheService,
        private modalController: ModalController,
    ) { }

    ngOnInit() {
    }

    slideOpts = {
        centeredSlides: 'true',
        initialSlide: 0,
    };
    
    async hide(){
        this.showFunctionPanel = false;
        this.showFacePanel = false;
    }

    

}
