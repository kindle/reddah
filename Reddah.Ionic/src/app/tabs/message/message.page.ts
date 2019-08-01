import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { Article } from '../../model/article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController } from '@ionic/angular';
import { LocalePage } from '../../common/locale/locale.page';
import { PostviewerPage } from '../../postviewer/postviewer.page';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import { MyInfoPage } from '../../common/my-info/my-info.page';
import { StatusBar } from '@ionic-native/status-bar';
import { ChatPage } from '../../chat/chat.page';
import { GroupChatPage } from '../../chat/group-chat.page';

@Component({
    selector: 'app-message',
    templateUrl: 'message.page.html',
    styleUrls: ['message.page.scss']
})
export class MessagePage implements OnInit {

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
        this.loadData();
    }

    messages = [];
    loadData(){
        this.reddah.getMessages().subscribe(data => 
        {
            console.log(data)
            
            this.messages = data.Message;
            
        });  
    }

    GetSender(groupName){
        return groupName.replace(this.currentUserName,"").replace(",","");
    }

    async viewChat(message) {
        if(message.Type==2){
            this.chat(message.GroupName)
        }
        else if(message.Type==3)
        {
            this.goGroupChat(message);
        }
    }
    
    async chat(groupName){
        let target = this.GetSender(groupName);
        const modal = await this.modalController.create({
            component: ChatPage,
            componentProps: { 
                title: this.reddah.appData('usernotename_'+target+'_'+this.currentUserName),
                target: target,
            }
        });
        await modal.present();
        const {data} = await modal.onDidDismiss();
    }

    async goGroupChat(groupChat){
        const modal = await this.modalController.create({
            component: GroupChatPage,
            componentProps: {
                groupChat: groupChat,
            }
        });
        await modal.present();
    }
}
