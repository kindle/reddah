import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import { ChatPage } from '../../chat/chat.page';
import { GroupChatPage } from '../../chat/group-chat.page';
import { ChatChooseUserPage } from '../../chat/chat-choose-user/chat-choose-user.page';
import { ShareChooseUserPage } from '../../chat/share-choose-user/share-choose-user.page';

@Component({
    selector: 'app-share-choose-chat',
    templateUrl: 'share-choose-chat.page.html',
    styleUrls: ['share-choose-chat.page.scss']
})
export class ShareChooseChatPage implements OnInit {

    @Input() title;
    @Input() article: any;
    
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

    async ngOnInit(){
        this.loadData(true);
        setInterval(() => {
            this.loadData(true);
        },5000);
    }

    async createNewChat(){
        const modal = await this.modalController.create({
            component: ShareChooseUserPage,
            componentProps: {
                article: this.article,
            }
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data)
            this.modalController.dismiss();
    }

    async close(){
        await this.modalController.dismiss();
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
                    this.messages.unshift(netMsg);
                }
            });
            this.localStorageService.store("Reddah_Local_Messages", this.messages);
        });  
    }

    GetSender(groupName){
        return groupName.replace(this.currentUserName,"").replace(",","");
    }

    async chooseChat(message) {
        let selectedArticleId = message.Id;
        let formData = new FormData();
        formData.append("abstract", this.reddah.htmlDecode(this.article.Title));
        formData.append("content", this.article.ImageUrl);
        formData.append("ref", JSON.stringify(this.article.Id));
        formData.append("chatid", JSON.stringify(selectedArticleId));

        if(message.Type==2||message.Type==3){
            this.reddah.shareToFriend(formData)
            .subscribe(result => 
            {
                if(result.Success==0)
                { 
                    this.close()
                }
                else{
                    alert(result.Message);
                }
            });
        }

    }
}
