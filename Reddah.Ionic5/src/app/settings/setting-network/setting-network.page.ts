import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../auth.service';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-setting-network',
    templateUrl: './setting-network.page.html',
    styleUrls: ['./setting-network.page.scss'],
})
export class SettingNetworkPage implements OnInit {

    currentNetwork = 2;
    
    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        public authService: AuthService,
    ) { 
        this.currentNetwork = this.reddah.getCurrentNetwork();
    }

    refreshPage;
    ngOnInit() {
        this.test();
        this.refreshPage = setInterval(()=>{
            this.test();
        },5000);
    }

    ionViewWillLeave() {
        clearInterval(this.refreshPage);
    }

    async close() {
        await this.modalController.dismiss();
    }

    async changeNetwork(n){
        this.currentNetwork = n;
        this.reddah.setCurrentNetwork(n);
    }

    

    isNetworkSelected(network){
        return this.currentNetwork==network.Id;
    }

    async test(){
        this.reddah.networks.forEach((network, index, alias)=>{
            network["start"] = new Date().getTime();
            this.reddah.healthCheck(network).subscribe(data=>{
                let end =  new Date().getTime();
                network["latency"] = end - network["start"] + "ms";
            });
        })
    }

}
