import { Component, OnInit, ViewChild, Input, NgZone } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController, Platform, Content } from '@ionic/angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { ImageViewerComponent } from '../../common/image-viewer/image-viewer.component';
import { VideoViewerComponent } from '../../common/video-viewer/video-viewer.component';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { VideoEditor } from '@ionic-native/video-editor/ngx'
import { ChatPopPage } from '../../common/chat-pop.page';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { ChatOptPage } from '../../chat/chat-opt/chat-opt.page';
import { UserPage } from '../user/user.page';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from 'ionic-cache';
import { ChangePhotoPage } from '../change-photo/change-photo.page';
import { SettingSignaturePage } from '../../settings/setting-signature/setting-signature.page';
import { SettingSexPage } from '../../settings/setting-sex/setting-sex.page';
import { MapPage } from '../../map/map.page';
import { AddTimelinePage } from '../../mytimeline/add-timeline/add-timeline.page';
import { TimelinePopPage } from '../timeline-pop.page';
import { ApiAiClient } from 'api-ai-javascript/es6/ApiAiClient'

@Component({
    selector: 'app-mystic',
    templateUrl: 'mystic.page.html',
    styleUrls: ['mystic.page.scss']
})
export class MysticPage implements OnInit {

    @Input() hasNewMsg: boolean;


    userName: string;
    locale: string;

    message:string = ''
    messages: object[];

    writing = 0;
    
    constructor(
        public modalController: ModalController,
        public popoverController: PopoverController,
        public reddah: ReddahService,
        public localStorageService: LocalStorageService,
        private media: Media,
        private nativeAudio: NativeAudio,
        private transfer: FileTransfer, 
        private file: File,
        public platform: Platform,
        public streamingMedia: StreamingMedia,
        public videoEditor: VideoEditor,
        public clipboard: Clipboard,
        private notification: LocalNotifications,
        private translate: TranslateService,
        private cacheService: CacheService,
        private zone: NgZone,   
    ) { 
        this.userName = this.reddah.getCurrentUser();
        this.locale = this.reddah.getCurrentLocale();
        this.getMysticPhoto();
        if (this.platform.is('cordova')) {
            this.nativeAudio.preloadSimple('bi', 'assets/sound/bi.mp3')
        }
    }
    
///pop up new window
    async htmlPlayVideo(id, src, poster){
        
        const modal = await this.modalController.create({
            component: VideoViewerComponent,
            componentProps: {
                id: id,
                src: src,
                poster: poster,
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true
        });
    
        await modal.present();

    }


    async viewer(index, imageSrcArray) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
                index: index,
                imgSourceArray: this.reddah.preImageArray(imageSrcArray),
                imgTitle: "",
                imgDescription: "",
                showDownload: true,
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true
        });
    
        return await modal.present();
    }

    refreshPage;
    ionViewWillLeave() {
        clearInterval(this.refreshPage);
    }

    private lastScrollTop: number = 0;
    didScrollUp = false;
    onScroll($event) {
        let currentScrollTop = $event.detail.scrollTop;
        
        if(currentScrollTop > this.lastScrollTop)
        {
            //'down';

        }
        else
        {
            //'up';
            this.didScrollUp = true;
        }
        this.lastScrollTop = currentScrollTop;
    }

    async showChatMenu(ev: any, content){
        const popover = await this.popoverController.create({
            component: ChatPopPage,
            event: ev,
            cssClass: 'chat-pop-popover'
        });

        await popover.present();
        const { data } = await popover.onDidDismiss();
        
        if(data==1)//copy
        {
            this.clipboard.copy(content);
        }
    }

    

    
    @ViewChild('pageTop') pageTop: Content;
    @ViewChild('chatbox') chatbox;

    @Input() title: any;
    @Input() source;//source ==pub or ""

    //placeholder
    groupChat;

    chatId = -1;

    
    ngOnInit() {
        this.generateChat();
    }

    
    //test
    clear(){
        //this.localStorageService.clear(`Reddah_Mystic_Chat_${this.userName}`);
        this.messages = [];
    }

    async childReloadComments(event){
        //this.hasNewMsg = true;
        //this.getChat();
    }

    //user input sth.
    async childLocalComments(event){
        this.addMessage({
            CreatedOn: Date.now(),
            Content: event.text, 
            UserName: this.userName, 
            Type: event.type
        });

        setTimeout(()=>{
            this.generateReactiveChat(event.text);
        },1000);
        
    }

    addMessage(msg){
        let maxId = Math.max.apply(null,this.messages.map(item=>item["Id"]).filter(m=>m!=null));
        msg.Id = maxId+1;

        if(msg.CreatedOn==null){
            msg.CreatedOn = Date.now();
        }
        
        this.messages.push(msg);
        //this.localStorageService.store(`Reddah_Mystic_Chat_${this.userName}`, this.messages);
    
        if(this.pageTop.scrollToBottom){
            this.pageTop.scrollToBottom(0);
        }
        setTimeout(()=>{
            if(this.pageTop.scrollToBottom){
                this.pageTop.scrollToBottom(0);
            }
        },1000)
    }

    formData;
    lastInputText;
    async generateReactiveChat(inputText){
        if(this.generateChat())
        {
            /*google mobile api
            let token = "";
            const en_us_token = "b43ae9dcee7b42d489c115c747604fdd";
            const zh_cn_token = "66dc4f2fb4ff49efaac6edda55eb0df1";
            if(this.reddah.getCurrentLocale()=="zh_CN")
            {
                token = zh_cn_token;
            }
            else{
                token = en_us_token;
            }
            const client = new ApiAiClient({ accessToken: token });
            client.textRequest(inputText)
            .then(res => {
                const speech = res.result.fulfillment.speech;
                this.addMessage({
                    //Content: this.translate.instant("Common.Font1"), 
                    Content: speech, 
                    UserName: 'Mystic', 
                    Type:0,
                });
            });
            */

            this.writing = 1;

            let app_id = this.reddah.qq_app_id;
            let app_key = this.reddah.qq_app_key;
            let time_stamp = new Date().getTime();
            let nonce_str = this.reddah.nonce_str();
            
            let session = this.reddah.getCurrentUser();
            let question = this.reddah.specialChars(inputText);

            let params1 = {
                "app_id":app_id,
                "time_stamp":Math.floor(time_stamp/1000),
                "nonce_str":nonce_str,
                "session":session,
                "question":question,
                "sign":""
            }
            
            params1["sign"] = this.reddah.getReqSign(params1, app_key);
            
            if(this.reddah.getCurrentLocale()=="zh-CN"||
            this.reddah.getCurrentLocale()=="zh-TW")
            {//qq api
                this.reddah.getQqNlpChat(params1, app_key).subscribe(data=>{
                    let response1 = JSON.parse(data.Message)
                    let answer = response1.data.answer;
                    let time = new Date().getTime();
                    
                    if(data.Success==0){
                        if(response1.ret!=0)
                        {
                            answer = this.translate.instant("Mystic.ChangeQuest");
                        }
                        else{
                            let audioMagicNumber = this.reddah.getRandomInt(4);
                            console.log(audioMagicNumber)
                            if(audioMagicNumber==0){//random audio output
                                let params4 = {
                                    "app_id":app_id,
                                    "time_stamp":Math.floor(time_stamp/1000),
                                    "nonce_str":nonce_str,
                                    "speaker":this.reddah.appData('usersex_'+this.userName)==1?1:this.girlVoice,
                                    "format":2,
                                    "volume":0,
                                    "speed":100,
                                    "text":this.reddah.specialChars(answer),
                                    "aht":0,
                                    "apc":58,
                                    "sign":""
                                }
                                setTimeout(()=>{this.writing = 2;},1000);
                                params4["sign"] = this.reddah.getReqSign(params4, app_key);
                                this.reddah.getQqAudioPlay(params4, app_key).subscribe(data=>{
                                    console.log(data)
                                    let response4 = JSON.parse(data.Message)
                                    let audioAnswer = response4.data.speech;
                                    let time = new Date().getTime();
                                    this.zone.run(()=>{this.writing = 0;});
                                    if(data.Success==0){
                                        if(response4.ret!=0)
                                        {
                                            if(response1.ret==0){
                                                this.addMessage({
                                                    CreatedOn: time,
                                                    Content: response1.data.answer, 
                                                    UserName: 'Mystic', 
                                                    Type:0
                                                });
                                            }
                                            else{
                                                this.addMessage({
                                                    CreatedOn: time,
                                                    Content: this.translate.instant("Mystic.ChangeQuest"), 
                                                    UserName: 'Mystic', 
                                                    Type:0
                                                });
                                            }
                                        }
                                        else{
                                            let newMsg = {
                                                CreatedOn: time,
                                                Content: audioAnswer, 
                                                UserName: 'Mystic', 
                                                Type:1,
                                                Base64: true,
                                                Duration: 1
                                            };
                                            this.reddah.getAudioDuration(newMsg);
                                            this.addMessage(newMsg);
                                        }
                                    }
                                    this.zone.run(()=>{this.writing = 0;});
                                    
                                });
                            }
                            else{//text output
                                this.addMessage({
                                    CreatedOn: time,
                                    Content: answer, 
                                    UserName: 'Mystic', 
                                    Type:0,
                                });
                            }
                        }
                        
                    }
                    this.writing = 0;
                });
                
            }
            else//(this.reddah.getCurrentLocale()=="en-US")
            {
                let params1 = {
                    "app_id":app_id,
                    "time_stamp":Math.floor(time_stamp/1000),
                    "nonce_str":nonce_str,
                    "text":question,
                    "source":this.reddah.adjustLan(),
                    "target":"zh",
                    "sign":""
                }
                
                params1["sign"] = this.reddah.getReqSign(params1, app_key);

                this.reddah.getQqTextTranslate(params1, app_key).subscribe(data=>{
                    console.log(data)
                    let response1 = JSON.parse(data.Message)
                    let traslatedQuestion = response1.data.target_text;
                    this.zone.run(()=>{this.writing = 0;});
                    if(data.Success==0){
                        if(response1.ret!=0)
                        {
                            traslatedQuestion = this.translate.instant("Mystic.ChangeQuest");
                        }
                        let params2 = {
                            "app_id":app_id,
                            "time_stamp":Math.floor(time_stamp/1000),
                            "nonce_str":nonce_str,
                            "session":session,
                            "question":this.reddah.specialChars(traslatedQuestion),
                            "sign":""
                        }
                        
                        params2["sign"] = this.reddah.getReqSign(params2, app_key);
                        setTimeout(()=>{this.writing = 1;},2000);
                        this.reddah.getQqNlpChat(params2, app_key).subscribe(data=>{
                            let response2 = JSON.parse(data.Message)
                            let answer = response2.data.answer;
                            this.zone.run(()=>{this.writing = 0;});
                            if(data.Success==0){
                                if(response2.ret!=0)
                                {
                                    answer = this.translate.instant("Mystic.ChangeQuest");
                                }
                                setTimeout(()=>{this.writing = 1;},1000);
                                
                                let params3 = {
                                    "app_id":app_id,
                                    "time_stamp":Math.floor(time_stamp/1000),
                                    "nonce_str":nonce_str,
                                    "text":this.reddah.specialChars(answer),
                                    "source":"zh",
                                    "target":this.reddah.adjustLan(),
                                    "sign":""
                                }
                                
                                params3["sign"] = this.reddah.getReqSign(params3, app_key);
                                this.reddah.getQqTextTranslate(params3, app_key).subscribe(data=>{
                                    console.log(data)
                                    let response3 = JSON.parse(data.Message)
                                    let traslatedAnswer = response3.data.target_text;
                                    let time = new Date().getTime();
                                    this.zone.run(()=>{this.writing = 0;});
                                    if(data.Success==0){
                                        if(response3.ret!=0)
                                        {
                                            traslatedAnswer = this.translate.instant("Mystic.ChangeQuest");
                                        }
                                        let audioMagicNumber = this.reddah.getRandomInt(2);
                                        console.log(audioMagicNumber)
                                        if(audioMagicNumber<-11){//random audio output only zh has audio
                                            let params4 = {
                                                "app_id":app_id,
                                                "time_stamp":Math.floor(time_stamp/1000),
                                                "nonce_str":nonce_str,
                                                "speaker":this.reddah.appData('usersex_'+this.userName)==1?1:this.girlVoice,
                                                "format":2,
                                                "volume":0,
                                                "speed":100,
                                                "text":this.reddah.specialChars(traslatedAnswer),
                                                "aht":0,
                                                "apc":58,
                                                "sign":""
                                            }
                                            setTimeout(()=>{this.writing = 1;},1000);
                                            params4["sign"] = this.reddah.getReqSign(params4, app_key);
                                            this.reddah.getQqAudioPlay(params4, app_key).subscribe(data=>{
                                                console.log(data)
                                                let response4 = JSON.parse(data.Message)
                                                let audioAnswer = response4.data.speech;
                                                let time = new Date().getTime();
                                                this.zone.run(()=>{this.writing = 0;});
                                                if(data.Success==0){
                                                    if(response4.ret!=0)
                                                    {
                                                        if(response2.ret==0){
                                                            this.addMessage({
                                                                CreatedOn: time,
                                                                Content: response2.data.answer, 
                                                                UserName: 'Mystic', 
                                                                Type:0
                                                            });
                                                        }
                                                        else{
                                                            this.addMessage({
                                                                CreatedOn: time,
                                                                Content: this.translate.instant("Mystic.ChangeQuest"), 
                                                                UserName: 'Mystic', 
                                                                Type:0
                                                            });
                                                        }
                                                    }
                                                    else{
                                                        let newMsg = {
                                                            CreatedOn: time,
                                                            Content: audioAnswer, 
                                                            UserName: 'Mystic', 
                                                            Type:1,
                                                            Base64: true,
                                                            Duration: 1
                                                        };
                                                        this.reddah.getAudioDuration(newMsg);
                                                        this.addMessage(newMsg);
                                                    }
                                                }
                                                this.zone.run(()=>{this.writing = 0;});
                                                
                                            });
                                        }
                                        else{//text output
                                            this.addMessage({
                                                CreatedOn: time,
                                                Content: traslatedAnswer, 
                                                UserName: 'Mystic', 
                                                Type:0,
                                            });
                                        }
                                    }
                                });
                                

                            }
                            
                        });

                    }
                    
                });

                /*
                this.formData.append("locale", this.reddah.getCurrentLocale());
                this.formData.append("content", inputText);
                this.reddah.getNlpChat(this.formData).subscribe(data=>{
                    let response = JSON.parse(data.Message)
                    let answer = response.result.fulfillment.speech;
                    let time = (response.timestamp+"")
                    
                    if(data.Success==0){
                        this.addMessage({
                            CreatedOn: time,
                            Content: answer, 
                            UserName: 'Mystic', 
                            Type:0,
                        });
                    }
                    this.writing = 0;
                });*/

            }

            

        }
        else{
            this.lastInputText = inputText;
        }
    }

    audio = new Audio();
    lastPlayComment = null;
    async play(comment){
        if(!comment.isPlaying){
            if(this.lastPlayComment!=null){
                this.lastPlayComment.isPlaying = false;
            }
            let audioChatUrl = comment.Base64? "data:audio/wav;base64," + comment.Content:
                "https://login.reddah.com/uploadPhoto/"+comment.Content;
            comment.isPlaying= true;
            this.audio.src = audioChatUrl; 
            this.audio.play();
            this.audio.addEventListener('ended', ()=>{
                if(comment.isPlaying){
                    this.nativeAudio.play("bi");
                }
                comment.isPlaying= false;
            });
            this.lastPlayComment = comment;
        }
    }

    mysticPhoto = "assets/500/500.jpeg";
    getMysticPhoto(){
        this.mysticPhoto = "assets/500/50" + this.reddah.getRandomInt(8)+".jpeg";
        let rv = this.reddah.getRandomInt(2);
        if(rv==0)
            this.girlVoice = 5;
        if(rv==1)
            this.girlVoice = 6;    
        if(rv==2)
            this.girlVoice = 7;
    }

    girlVoice = 5;

    

    photoPopped = false;
    postPopped = false;

    generateChat(){
        let continueFlag = true;
        if(this.messages==null||this.messages.length==0){
            this.messages = [];
            setTimeout(()=>{
                this.addMessage({
                    Content: this.translate.instant("Mystic.Welcome"), 
                    UserName: 'Mystic', 
                    Type:0,
                    Id:0,
                });
            },1000)
        }
        else
        {
            //photo
            if(continueFlag){
                let user_photo = this.reddah.appData('userphoto_'+this.userName);
                if(user_photo=="assets/icon/anonymous.png"&&!this.photoPopped){
                    console.log('no photo yet')
                    this.addMessage({
                        Content: this.translate.instant("Mystic.AddPhoto"), 
                        UserName: 'Mystic', 
                        Type:0,
                        Action: 0,
                    });
                    this.photoPopped = true;
                    continueFlag = false;
                }
            }
            //sex
            if(continueFlag){
                let user_sex_set = this.localStorageService.retrieve("user_sex_set"+this.userName);
                if(user_sex_set==null){
                    this.addMessage({ 
                        Content: this.translate.instant("Mystic.SetSex"), 
                        UserName: 'Mystic', 
                        Type:0,
                        Action: 1,
                    });
                    continueFlag = false;
                }
            }
            
            //signature
            if(continueFlag){
                let user_signature = this.reddah.appData('usersignature_'+this.userName);
                if(user_signature==null||user_signature.length==0){
                    this.addMessage({
                        Content: this.translate.instant("Mystic.SetSignature"), 
                        UserName: 'Mystic', 
                        Type:0,
                        Action: 2,
                    });
                    continueFlag = false;
                }
            }
            

            //find a friend in map
            if(continueFlag){
                let cachedContact = this.localStorageService.retrieve("Reddah_Contacts");
                
                if(cachedContact==null||cachedContact.length==0){
                    this.addMessage({
                        Content: this.translate.instant("Mystic.AddFriend"), 
                        UserName: 'Mystic', 
                        Type:0,
                        Action: 3,
                    });
                    continueFlag = false;
                }
            }

            //add a post
            if(continueFlag){
                this.getTimeline()
                .subscribe(timeline => 
                {
                    if(timeline.length==0&&!this.postPopped){
                        this.addMessage({
                            Content: this.translate.instant("Mystic.AddPost"), 
                            UserName: 'Mystic', 
                            Type:0,
                            Action: 4,
                        });
                        this.postPopped = true;
                        continueFlag = false;
                    }
                });
            }

            /*
            //play a game
            if(continueFlag){
                this.getUsedMini()
                .subscribe(minis => 
                {
                    if(minis.length==0){
                        this.addMessage({
                            Content: this.translate.instant("Mystic.AddGame"), 
                            UserName: 'Mystic', 
                            Type:0,
                            Action: 5,
                        });
                        continueFlag = false;
                    }
                });
            }
            */

            //check user punch today
        }

        return continueFlag;
        
    }

    loadedIds=[];
    getTimeline(){
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getTimeline"+this.userName;
        let request = this.reddah.getTimeline(this.formData);

        return this.cacheService.loadFromObservable(cacheKey, request, "TimeLinePage"+this.userName)
        
    }

    getUsedMini(){
        this.formData = new FormData();
        this.formData.append("targetUser", this.userName);

        let cacheKey = "this.reddah.getUsedMini"+this.userName;
        let request = this.reddah.getUsedMini(this.formData);

        return this.cacheService.loadFromObservable(cacheKey, request, "UserPage"+this.userName)
        
    }

    setInfo(action){
        if(action==0){
            this.changePhoto()
        }
        else if(action==1){
            this.changeSex();
        }
        else if(action==2){
            this.changeSignature();
        }
        else if(action==3){
            this.openMap();
        }
        else if(action==4){
            this.post(null);
        }
        else if(action==5){
            this.playGame();
        }

    }

    async changePhoto(){
        const userModal = await this.modalController.create({
          component: ChangePhotoPage,
          componentProps: { 
              title: this.translate.instant("About.Photo"),
              tag : "portrait",
              targetUserName: ""
          },
          cssClass: "modal-fullscreen",
        });
          
        await userModal.present();
        const { data } = await userModal.onDidDismiss();
        if(data)
        {
            this.reddah.getUserPhotos(this.userName);
            setTimeout(()=>this.generateReactiveChat(this.lastInputText),3000);
        }
    }

    async changeSex(){
        let currentValue = this.reddah.appData('usersex_'+this.userName);
        if(currentValue instanceof Number)
        {}    
        else
        {
            currentValue = 0;
        }

        const modal = await this.modalController.create({
            component: SettingSexPage,
            componentProps: {
                title: this.translate.instant("About.Sex"),
                currentSex: currentValue
            },
            cssClass: "modal-fullscreen",
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data)
        {
            this.reddah.getUserPhotos(this.userName);
            this.localStorageService.store("user_sex_set"+this.userName, data);
            
            setTimeout(()=>this.generateReactiveChat(this.lastInputText),3000);
        }
    }

    async changeSignature(){
        const modal = await this.modalController.create({
            component: SettingSignaturePage,
            componentProps: {
                title: this.translate.instant("About.Signature"),
                currentSignature: this.reddah.appData('usersignature_'+this.userName)
            },
            cssClass: "modal-fullscreen",
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data||!data){
            this.reddah.getUserPhotos(this.userName);
            setTimeout(()=>this.generateReactiveChat(this.lastInputText),3000);
        }
    }

    async openMap(){
        const modal = await this.modalController.create({
            component: MapPage,
            componentProps: {
                //lat: this.config.lat,
                //lng: this.config.lng
            },
            cssClass: "modal-fullscreen",
        });
            
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data||!data){
            setTimeout(()=>this.generateReactiveChat(this.lastInputText),3000);
        }
    }

    async post(ev: any) {
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
            componentProps: { postType: postType },
            cssClass: "modal-fullscreen",
        });
          
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            setTimeout(()=>this.generateReactiveChat(this.lastInputText),3000);
        }
    }

    async playGame(){
        alert('recommend a game...')
    }
    

    private fileTransfer: FileTransferObject; 
    async preload(guidName){
        let path = this.localStorageService.retrieve(guidName);

        if(path==null){
            let target = this.reddah.getDeviceDirectory() +"reddah/"+ guidName;
            this.file.checkFile(this.reddah.getDeviceDirectory() +"reddah/", guidName)
            .then(_ =>{
                this.localStorageService.store(guidName, target);
            })
            .catch(err =>{
                this.fileTransfer = this.transfer.create();  
                this.fileTransfer.download("https://login.reddah.com/uploadPhoto/"+guidName, target, true).then((entry) => {
                    this.localStorageService.store(guidName, target);
                }, (error) => {
                    //console.log(JSON.stringify(error));
                    alert(JSON.stringify(error));
                });
            });
        }
        
    }


    async close() {
        await this.modalController.dismiss();
    }

    async option(){
        if(this.source){
            /*const modal = await this.modalController.create({
                component: PubPage,
                componentProps: { userName: this.target },
            cssClass: "modal-fullscreen",
            });
              
            await modal.present();*/
            this.close();
        }
        else
        {
            const modal = await this.modalController.create({
                component: ChatOptPage,
                componentProps: { targetUser: this.userName },
                cssClass: "modal-fullscreen",
            });
            
            await modal.present();

            const { data } = await modal.onDidDismiss();
            if(data=="clearchat")
            {
                this.clear();
            }
        }
    }


    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
        });
            
        await userModal.present();
    }

    
}

