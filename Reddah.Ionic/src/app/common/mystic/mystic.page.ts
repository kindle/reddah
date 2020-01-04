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


            console.log(this.reddah.getCurrentLocale())
            if(this.reddah.getCurrentLocale()=="zh-CN"||
            this.reddah.getCurrentLocale()=="zh-TW")
            {//qq api
                let app_id = 2127183732;
                let app_key = "493J0jD8PPeNUHNz";
                let time_stamp = new Date().getTime();
                let nonce_str = this.reddah.nonce_str();
                
                let session = this.reddah.getCurrentUser();
                let question = inputText;

                let params = {
                    "app_id":app_id,
                    "time_stamp":Math.floor(time_stamp/1000),
                    "nonce_str":nonce_str,
                    "session":session,
                    "question":question,
                    "sign":""
                }
                
                params["sign"] = this.reddah.getReqSign(params, app_key);
                
                this.reddah.getQqNlpChat(params, app_key).subscribe(data=>{
                    let response = JSON.parse(data.Message)
                    let answer = response.data.answer;
                    let time = new Date().getTime();
                    
                    if(data.Success==0){
                        if(response.ret!=0)
                        {
                            answer = "换个问题试试。";
                        }
                        this.addMessage({
                            CreatedOn: time,
                            Content: answer, 
                            UserName: 'Mystic', 
                            Type:0,
                        });
                    }
                });
            }
            else//(this.reddah.getCurrentLocale()=="en-US")
            {
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
                });
            }

        }
    }

    mysticPhoto = "assets/500/500.jpeg";
    getMysticPhoto(){
        this.mysticPhoto = "assets/500/50" + this.reddah.getRandomInt(8)+".jpeg";
    }
    
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
                if(user_photo=="assets/icon/anonymous.png"){
                    console.log('no photo yet')
                    this.addMessage({
                        Content: this.translate.instant("Mystic.AddPhoto"), 
                        UserName: 'Mystic', 
                        Type:0,
                        Action: 0,
                    });
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
                    if(timeline.length==0){
                        this.addMessage({
                            Content: this.translate.instant("Mystic.AddPost"), 
                            UserName: 'Mystic', 
                            Type:0,
                            Action: 4,
                        });
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
        if(data||!data)
            this.reddah.getUserPhotos(this.userName);
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

