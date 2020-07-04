import { Component, OnInit } from '@angular/core';
//import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ModalController, NavController } from '@ionic/angular';
import { UserPage } from '../user/user.page';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-scan',
    templateUrl: './scan.page.html',
    styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {

    constructor(
        public reddah: ReddahService,
        private modalController: ModalController,
        public navController: NavController,
        //private barcodeScanner: BarcodeScanner,
    ) { }

    debug = "";
    ngOnInit(){
        this.scanner();
    }

    close(){
        this.navController.back();
    }

    scanner(){
        /*this.barcodeScanner.scan().then(barcodeData => {
            let text = barcodeData.text;
            if(text.startsWith(this.reddah.QrUserKey))
            {
                this.goUser(text.replace(this.reddah.QrUserKey,""));
            }
            else{
                const browser = this.iab.create(text);
                browser.show();
            }
        }).catch(err => {
            console.log('Error', err);
        });*/
    }
    /*
    // Show scanner 
    scanner() {
        (window.document.querySelector('html') as HTMLElement).classList.add('cameraView');
        // Optionally request the permission early
        QRScanner.prepare()
        .then((status: QRScannerStatus) => {
            if (status.authorized) {
                // camera permission was granted
                this.debug+= "authorized"
                
                // start scanning
                let scanSub = QRScanner.scan().subscribe((text: string) => {
                    console.log('Scanned something', text);
                    
                    
                    if(text.startsWith(this.reddah.QrUserKey))
                    {
                        this.goUser(text.replace(this.reddah.QrUserKey,""));
                    }
                    else{
                        alert(text);
                    }
                    this.debug+= text;
                    QRScanner.hide(); // hide camera preview
                    scanSub.unsubscribe(); // stop scanning
                    //this.modalController.dismiss();
                });

                QRScanner.resumePreview();
               
                // show camera preview
                QRScanner.show()
                    .then((data: QRScannerStatus) => {
                        console.log('datashowing', data.showing);
                        this.debug+= data.showing
                    }, err => {
                        console.log('show error', err);
                        this.debug+= err;
                    });


            } else if (status.denied) {
                // camera permission was permanently denied
                // you must use QRScanner.openSettings() method to guide the user to the settings page
                // then they can grant the permission from there
                this.debug+= "denied"
            } else {
                // permission was denied, but not permanently. You can ask for permission again at a later time.
                this.debug+= "else"
            }
        })
        .catch((e: any) => {console.log('Error is', e);this.debug+= e});

        
    }
    */

    ionViewWillLeave() {
        (window.document.querySelector('html') as HTMLElement).classList.remove('cameraView');
        //QRScanner.hide();
        //QRScanner.destroy();
    }

    light=false;
    frontCamera=false;
    
    toggleLight() {
        if (this.light) {
          //QRScanner.disableLight();
        } else {
          //QRScanner.enableLight();
        }
        this.light = !this.light;
    }
  
    toggleCamera() {
        if (this.frontCamera) {
          //QRScanner.useBackCamera();
        } else {
          //QRScanner.useFrontCamera();
        }
        this.frontCamera = !this.frontCamera;
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
        const { data } = await userModal.onDidDismiss();
        if(data){
            this.scanner();
        }
        else{
            this.scanner();
        }
    }

}
