import { Component, OnInit, ViewChild } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";

import { ChatFirePage } from '../../chatfire/chat-fire.page';
import { GroupChatFirePage } from '../../chatfire/group-chat-fire.page';


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

        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
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
                console.log(netMsg)
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
                    this.messages.unshift(netMsg);
                    
                    netMsg.GroupName.split(',').forEach((user, index)=>{
                        if(user!=this.currentUserName){
                            this.reddah.getUserPhotos(user);
                        }
                    });
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
