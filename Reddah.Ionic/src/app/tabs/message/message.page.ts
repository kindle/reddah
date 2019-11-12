import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ChatFirePage } from '../../chatfire/chat-fire.page';
import { GroupChatFirePage } from '../../chatfire/group-chat-fire.page';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';


@Component({
    selector: 'app-message',
    templateUrl: 'message.page.html',
    styleUrls: ['message.page.scss']
})
export class MessageListPage implements OnInit {

    currentUserName: any;

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        private platform: Platform,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private zone: NgZone,
        private notification: LocalNotifications,

    ){
        this.currentUserName = this.reddah.getCurrentUser();
    }

    //refreshPage;
    ngOnInit(){
        this.loadData(true);
        /*this.refreshPage = setInterval(() => {
            this.loadData(true);
        },5000);*/
    }

    /*
    ionViewWillLeave() {
        clearInterval(this.refreshPage);
    }*/

    clear(){
        this.localStorageService.clear("Reddah_Local_Messages");
        this.messages = [];
        this.loadData(false);
    }

    messages = [];
    async loadData(isnew){
        let localMessages = this.localStorageService.retrieve("Reddah_Local_Messages");
        if(localMessages!=null){
            this.messages = localMessages;
        }

        this.reddah.getMessages().subscribe(data => 
        {
            let netMessages = data.Message?data.Message.reverse():[];//from last to newest
            netMessages.forEach((netMsg, indexN)=>{
                netMsg.IsNew=isnew;
                let found = false;
                this.messages.forEach((localMsg, indexL)=>{
                    if(netMsg.Id==localMsg.Id)
                    {
                        if(netMsg.LastUpdateOn!=localMsg.LastUpdateOn){
                            this.messages.splice(indexL, 1);
                            this.messages.unshift(netMsg);
                            if(netMsg.LastUpdateBy==this.currentUserName)
                                netMsg.IsNew = false;
                        }
                        found=true;
                    }
                });
                if(!found)
                {
                    let title = "";
                    let text = "";
                    if(netMsg.Type==2){//people
                        title = netMsg.GroupName;
                    } 
                    else if(netMsg.Type==3){//group
                        title = netMsg.Title;
                    }

                    this.messages.unshift(netMsg);
                    
                    netMsg.GroupName.split(',').forEach((user, index)=>{
                        if(user!=this.currentUserName){
                            this.reddah.getUserPhotos(user);
                            text = `${user}: ${this.reddah.summaryMsg(netMsg.LastUpdateContent)}`;
                        }
                    });

                    if(this.platform.is('cordova')){
                        this.reddah.notify(title, text);
                    }
                }
            });
            this.localStorageService.store("Reddah_Local_Messages", this.messages);
        });  
    }

    GetSender(groupName){
        return groupName.replace(this.currentUserName,"").replace(",","");
    }

    async viewChat(message) {
        if(message.Type==2){
            this.chat(message.GroupName, message.IsNew)
        }
        else if(message.Type==3)
        {
            this.goGroupChat(message, message.IsNew);
        }
        message.IsNew = false;
        this.localStorageService.store("Reddah_Local_Messages", this.messages);
    }
    
    async chat(groupName, hasNewMsg){
        let target = this.GetSender(groupName);
        const modal = await this.modalController.create({
            //component: ChatPage,
            component: ChatFirePage,
            componentProps: { 
                title: this.reddah.appData('usernotename_'+target+'_'+this.currentUserName),
                target: target,
                hasNewMsg: hasNewMsg,
            },
            cssClass: "modal-fullscreen",
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
        if(data||!data){
            this.loadData(true);
        }
    }

    async goGroupChat(groupChat, hasNewMsg){
        const modal = await this.modalController.create({
            //component: GroupChatPage,
            component: GroupChatFirePage,
            componentProps: {
                groupChat: groupChat,
                hasNewMsg: hasNewMsg,
            },
            cssClass: "modal-fullscreen",
        });
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data=="delete"){
           this.clear();
        }
        if(data||!data){
            this.loadData(true);
        }
    }

    async close(){
        this.modalController.dismiss();
    }
}
