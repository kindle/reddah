import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ActionSheetController } from '@ionic/angular';

import { ReddahService } from '../../reddah.service';


@Component({
    selector: 'app-qrcard',
    templateUrl: './qrcard.page.html',
    styleUrls: ['./qrcard.page.scss'],
})
export class QrcardPage implements OnInit {

    userName: string;
    createdCode = null;

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private actionSheetController: ActionSheetController,
    ) { 
        this.userName = this.reddah.getCurrentUser();
    }

    ngOnInit() {
        this.createdCode = `${this.reddah.QrUserKey}${this.userName}`;
    }

    async close() {
        await this.modalController.dismiss();
    }

    async presentActionSheet() {
        const actionSheet = await this.actionSheetController.create({
          //header: '',
          buttons: [{
            text: '换个样式',
            icon: 'refresh',
            handler: () => {
                console.log('change style');
            }
          }, {
            text: '保存到手机',
            icon: 'save',
            handler: () => {
                console.log('save');
            }
          }, {
            text: '扫描二维码',
            icon: 'ios-qr-scanner',
            handler: () => {
                console.log('scan');
            }
          }, {
            text: '重置二维码',
            icon: 'refresh-circle',
            handler: () => {
                console.log('reset');
            }
          }]
        });
        await actionSheet.present();
    }


}
