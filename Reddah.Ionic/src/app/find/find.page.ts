import { Component } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';

@Component({
  selector: 'app-find',
  templateUrl: 'find.page.html',
  styleUrls: ['find.page.scss']
})
export class FindPage {
    constructor(private qrScanner: QRScanner){}
    debug = "";

    ionViewWillEnter(){
      window.document.querySelector('ion-app').classList.add('transparentBody')
    }
    
    ionViewDidLeave() {
      window.document.querySelector('ion-app').classList.remove('transparentBody')
    }

    qrScan(){
      // Optionally request the permission early
      this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          // camera permission was granted
          this.debug+= "authorized"

          // start scanning
          let scanSub = this.qrScanner.scan().subscribe((text: string) => {
            console.log('Scanned something', text);
            this.debug+= text;
            this.qrScanner.hide(); // hide camera preview
            scanSub.unsubscribe(); // stop scanning
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
}
