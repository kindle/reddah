import { Component, OnInit } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, Platform, AlertController } from '@ionic/angular';
import { ChatFirePage } from '../../chatfire/chat-fire.page';
import { GroupChatFirePage } from '../../chatfire/group-chat-fire.page';
import { MessagePage } from 'src/app/mytimeline/message/message.page';

@Component({
    selector: 'app-message',
    templateUrl: 'message.page.html',
    styleUrls: ['message.page.scss']
})
export class MessageListPage implements OnInit {

    currentUserName: any;

    categories = [{
        title: this.reddah.instant('Article.System'),
        color: "success",
        name: "information-circle-outline",
        type: 4,
        desc: this.reddah.instant('Article.SystemInfo')
    },{
        title: this.reddah.instant('Article.CommentMe'),
        color: "primary",
        name: "chatbubble-ellipses-outline",
        type: 2,
        desc: this.reddah.instant('Article.CommentYours')
    },{
        title: this.reddah.instant('Article.AtMe'),
        color: "secondary",
        name: "at-outline",
        type: 1,
        desc: this.reddah.instant('Article.AtYou')
    },{
        title: this.reddah.instant('Article.LikeMe'),
        color: "danger",
        name: "heart-circle-outline",
        type: 3,
        desc: this.reddah.instant('Article.LikeYours')
    }]

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        private platform: Platform,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private alertController: AlertController,

    ){
        this.currentUserName = this.reddah.getCurrentUser();
    }

    async deleteConfirm(message) {
        const alert = await this.alertController.create({
            header: this.reddah.instant("Confirm.Title"),
            message: this.reddah.instant("Confirm.DeleteMessage"),
            buttons: [
              {
                text: this.reddah.instant("Confirm.Cancel"),
                role: 'cancel',
                cssClass: 'secondary',
                handler: (blah) => {
                }
              }, {
                text: this.reddah.instant("Confirm.Yes"),
                handler: () => {
                    /*let foundFlag = false;
                    this.messages.forEach((m, index)=>{
                        if(!foundFlag&&m.Id==message.Id)
                        {
                            this.messages.splice(index, 1);
                            foundFlag = true;
                        }
                    });*/
                    message["delete"]=true;
                    message.IsNew = false;
                    this.localStorageService.store("Reddah_Local_Messages_"+this.reddah.getCurrentUser(), this.messages);
                }
              }
            ]
        });

        await alert.present().then(()=>{});
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
        this.localStorageService.clear("Reddah_Local_Messages_"+this.reddah.getCurrentUser());
        this.messages = [];
        this.loadData(false);
    }

    messages = [];
    async loadData(isnew){
        let localMessages = this.localStorageService.retrieve("Reddah_Local_Messages_"+this.reddah.getCurrentUser());
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
            this.localStorageService.store("Reddah_Local_Messages_"+this.reddah.getCurrentUser(), this.messages);
        });  
    }

    GetSender(groupName){
        return groupName.replace(this.currentUserName,"").replace(",","");
    }

    async viewChat(message) {
        console.log(message)
        if(message.Type==2){
            this.chat(message.GroupName, message.IsNew)
        }
        else if(message.Type==3)
        {
            this.goGroupChat(message, message.IsNew);
        }
        message.IsNew = false;
        this.localStorageService.store("Reddah_Local_Messages_"+this.reddah.getCurrentUser(), this.messages);
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

    async goMessage(category){
        const modal = await this.modalController.create({
            component: MessagePage,
            componentProps: {
                type:category.type,
                title:category.title
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }
}
